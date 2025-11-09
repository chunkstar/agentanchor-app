import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const { botId, message, conversationId, messages } = await req.json()

    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get bot configuration
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .eq('user_id', session.user.id)
      .single()

    if (botError || !bot) {
      return new Response('Bot not found', { status: 404 })
    }

    // Get MCP servers for this bot
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
      .eq('bot_id', botId)

    // Prepare messages for Claude
    const claudeMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }))

    // Add current message
    claudeMessages.push({
      role: 'user',
      content: message,
    })

    // Create streaming response
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

          const messageStream = await anthropic.messages.create({
            model: bot.model,
            max_tokens: bot.max_tokens,
            temperature: bot.temperature,
            system: systemPrompt,
            messages: claudeMessages,
            stream: true,
          })

          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ content: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error: any) {
          console.error('Streaming error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
