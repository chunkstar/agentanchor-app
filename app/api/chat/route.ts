/**
 * Chat API - Streaming chat with AI bots
 *
 * Phase 1 Enhanced: Error handling, validation, rate limiting, metrics
 */

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Phase 1 imports
import { catchErrors, AuthError, NotFoundError, AnthropicError } from '@/lib/errors'
import { ChatRequestSchema, validateRequest } from '@/lib/schemas'
import { enforceRateLimit, chatRateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { logger, logError, logPerformance } from '@/lib/logger'
import { trackChatMessage, calculateClaudeCost } from '@/lib/metrics'
import { anthropicCircuitBreaker } from '@/lib/circuit-breaker'
import { withTimeout } from '@/lib/retry'
import { config } from '@/lib/config'

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
})

export const POST = catchErrors(async (req: NextRequest) => {
  const startTime = Date.now()
  const encoder = new TextEncoder()

  // 1. Validate request body
  const data = await validateRequest(req, ChatRequestSchema)

  logger.info({
    type: 'chat_request',
    botId: data.botId,
    conversationId: data.conversationId,
    messageLength: data.message.length,
    historyLength: data.messages.length,
  })

  // 2. Authenticate user
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new AuthError('Authentication required for chat')
  }

  // 3. Enforce rate limiting
  const rateLimitResult = await enforceRateLimit(
    session.user.id,
    chatRateLimit,
    '/api/chat'
  )

  // 4. Get bot configuration with error handling
  const { data: bot, error: botError } = await supabase
    .from('bots')
    .select('*')
    .eq('id', data.botId)
    .eq('user_id', session.user.id)
    .single()

  if (botError || !bot) {
    logger.warn({
      type: 'bot_not_found',
      botId: data.botId,
      userId: session.user.id,
      error: botError?.message,
    })
    throw new NotFoundError('Bot')
  }

  // 5. Get MCP servers for this bot
  const { data: mcpServers } = await supabase
    .from('bot_mcp_servers')
    .select(`
      mcp_servers (
        id,
        name,
        type,
        config
      )
    `)
    .eq('bot_id', data.botId)

  // 6. Prepare messages for Claude
  const claudeMessages = data.messages.map((msg) => ({
    role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: msg.content,
  }))

  // Add current message
  claudeMessages.push({
    role: 'user',
    content: data.message,
  })

  // 7. Track token usage
  let inputTokens = 0
  let outputTokens = 0
  let fullResponse = ''

  // 8. Create streaming response with Phase 1 enhancements
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Add MCP context to system prompt if available
        let systemPrompt = bot.system_prompt
        if (mcpServers && mcpServers.length > 0) {
          const mcpContext = mcpServers
            .map((ms: any) => {
              const server = ms.mcp_servers
              return `\n\nYou have access to the following MCP server:\n- ${server.name} (${server.type})`
            })
            .join('')
          systemPrompt += mcpContext
        }

        // Call Claude API with circuit breaker protection
        const messageStream = await anthropicCircuitBreaker.execute(async () => {
          return withTimeout(
            anthropic.messages.create({
              model: bot.model,
              max_tokens: bot.max_tokens,
              temperature: bot.temperature,
              system: systemPrompt,
              messages: claudeMessages,
              stream: true,
            }),
            60000, // 60 second timeout
            'Claude API request timeout'
          )
        })

        // Process streaming events
        for await (const event of messageStream) {
          switch (event.type) {
            case 'message_start':
              inputTokens = event.message.usage.input_tokens
              logger.debug({
                type: 'stream_start',
                messageId: event.message.id,
                inputTokens,
              })
              break

            case 'content_block_delta':
              if (event.delta.type === 'text_delta') {
                const chunk = event.delta.text
                fullResponse += chunk

                // Send chunk to client
                const payload = JSON.stringify({ content: chunk })
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              }
              break

            case 'message_delta':
              if (event.usage) {
                outputTokens += event.usage.output_tokens
              }
              break

            case 'message_stop':
              logger.debug({
                type: 'stream_complete',
                outputTokens,
                responseLength: fullResponse.length,
              })
              break

            case 'error':
              throw new AnthropicError(event.error.message, {
                type: event.error.type,
              })
          }
        }

        // Stream complete
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()

        // 9. Track metrics and costs
        const duration = Date.now() - startTime
        const cost = calculateClaudeCost(bot.model, inputTokens, outputTokens)

        await trackChatMessage({
          userId: session.user.id,
          botId: data.botId,
          conversationId: data.conversationId,
          model: bot.model,
          inputTokens,
          outputTokens,
          duration,
          cost,
        })

        logPerformance('chat_request', duration, {
          botId: data.botId,
          inputTokens,
          outputTokens,
          cost: cost.toFixed(4),
        })
      } catch (error) {
        // Enhanced error handling in stream
        const err = error as Error

        logError(err, {
          type: 'stream_error',
          botId: data.botId,
          userId: session.user.id,
          conversationId: data.conversationId,
        })

        // Send error to client
        const errorPayload = JSON.stringify({
          error: err.message || 'An error occurred during streaming',
        })
        controller.enqueue(encoder.encode(`data: ${errorPayload}\n\n`))
        controller.close()

        // Re-throw to be caught by outer handler
        throw error
      }
    },
  })

  // 10. Create response with rate limit headers
  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })

  // Add rate limit headers if available
  if (rateLimitResult) {
    return addRateLimitHeaders(response, rateLimitResult)
  }

  return response
})
