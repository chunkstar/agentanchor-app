#!/usr/bin/env node
/**
 * Sync BAI ai-workforce agents to AgentAnchor
 * - Scans all YAML files from BAI
 * - Compares with current AgentAnchor database
 * - Imports missing agents
 * - Deduplicates
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { Client } = require('pg');

const BAI_AGENTS_DIR = 'C:/BAI/ai-workforce/bmad/agents';
const BAI_BAI_DIR = 'C:/BAI/ai-workforce/bmad/bai/agents';
const DRY_RUN = process.argv.includes('--dry-run');

// Level definitions
const LEVEL_DEFS = {
  L0: { name: 'Listener', authority: 'Observe and Report ONLY', autonomy: 'None' },
  L1: { name: 'Executor', authority: 'Execute assigned tasks', autonomy: 'Task-level only' },
  L2: { name: 'Planner', authority: 'Plan task sequences', autonomy: 'Task planning' },
  L3: { name: 'Orchestrator', authority: 'Coordinate workflows', autonomy: 'Workflow-level' },
  L4: { name: 'Project Planner', authority: 'Plan projects', autonomy: 'Project planning' },
  L5: { name: 'Project Orchestrator', authority: 'Execute projects', autonomy: 'Project execution' },
  L6: { name: 'Portfolio Manager', authority: 'Multi-project oversight', autonomy: 'Portfolio-level' },
  L7: { name: 'Strategic', authority: 'Strategic decisions', autonomy: 'Strategic (with constraints)' },
  L8: { name: 'Executive', authority: 'Enterprise-wide', autonomy: 'Executive (human oversight required)' }
};

const TRUST_SCORES = { L0: 25, L1: 35, L2: 45, L3: 50, L4: 55, L5: 60, L6: 65, L7: 75, L8: 100 };

// Parse YAML front matter
function parseAgentFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parts = content.split('---');
    if (parts.length < 3) return null;
    const frontMatter = yaml.parse(parts[1]);
    const markdownBody = parts.slice(2).join('---').trim();

    // Extract expertise
    const expertise = [];
    const expertiseMatch = markdownBody.match(/## Expertise\n\n([\s\S]*?)(?=\n##|$)/);
    if (expertiseMatch) {
      expertiseMatch[1].trim().split('\n').forEach(line => {
        const item = line.replace(/^-\s*/, '').trim();
        if (item) expertise.push(item);
      });
    }

    // Extract principles
    const principles = [];
    const principlesMatch = markdownBody.match(/## Principles\n\n([\s\S]*?)(?=\n##|$)/);
    if (principlesMatch) {
      principlesMatch[1].trim().split('\n').forEach(line => {
        const item = line.replace(/^-\s*/, '').trim();
        if (item) principles.push(item);
      });
    }

    return { ...frontMatter, expertise, principles, filePath };
  } catch (err) {
    return null;
  }
}

// Find all agent files recursively
function findAgentFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findAgentFiles(fullPath, files);
    } else if (item.endsWith('.agent.yaml') || item.endsWith('.agent.yml')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Convert BAI agent to AgentAnchor format
function convertAgent(bai, ownerId) {
  const level = bai.level || 'L1';
  const levelDef = LEVEL_DEFS[level] || LEVEL_DEFS.L1;

  const systemPrompt = `You are ${bai.name}, a Level ${level} ${levelDef.name} Agent.

## Identity
You are a specialized AI agent in the A3I ecosystem governed by the AgentAnchor platform. You operate under the Four Pillars of Truth, Honesty, Service, and Humanity.

## Role
${levelDef.name} - ${levelDef.authority}

## Expertise
${(bai.expertise || []).join(', ') || 'general tasks'}

## Principles
${(bai.principles || []).join('; ') || 'Act with integrity'}

## Communication Style
Professional, precise, and helpful.`;

  return {
    owner_id: ownerId,
    name: bai.name,
    description: `${bai.name} - ${levelDef.name}`,
    system_prompt: systemPrompt,
    model: 'claude-sonnet-4-20250514',
    status: 'draft',
    trust_score: 0,
    config: JSON.stringify({
      temperature: 0.7,
      maxTokens: 4096,
      specialization: bai.category || bai.division || 'general'
    }),
    metadata: JSON.stringify({
      icon: bai.icon || '🤖',
      source: 'bai-sync',
      level: level,
      levelName: levelDef.name,
      authority: levelDef.authority,
      domain: bai.division || bai.domain || 'general',
      group: bai.group || null,
      expertise: bai.expertise || [],
      principles: bai.principles || [],
      targetTrustScore: TRUST_SCORES[level] || 35,
      baiPath: bai.filePath,
      syncedAt: new Date().toISOString()
    })
  };
}

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log(DRY_RUN ? '🔍 DRY RUN MODE\n' : '🚀 LIVE MODE\n');

  // Step 1: Scan BAI agents
  console.log('Step 1: Scanning BAI ai-workforce...\n');
  const agentFiles = [...findAgentFiles(BAI_AGENTS_DIR), ...findAgentFiles(BAI_BAI_DIR)];
  console.log(`  Found ${agentFiles.length} agent YAML files\n`);

  const baiAgents = [];
  const levelCounts = {};
  for (const filePath of agentFiles) {
    const parsed = parseAgentFile(filePath);
    if (parsed && parsed.name) {
      baiAgents.push(parsed);
      const level = parsed.level || 'L1';
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    }
  }
  console.log(`  Parsed ${baiAgents.length} agents\n`);
  console.log('  Level distribution:', levelCounts, '\n');

  // Step 2: Get existing AgentAnchor agents
  console.log('Step 2: Fetching existing AgentAnchor agents...\n');
  const existing = await client.query('SELECT id, name FROM agents');
  const existingNames = new Set(existing.rows.map(r => r.name.toLowerCase()));
  console.log(`  Found ${existingNames.size} existing agents\n`);

  // Step 3: Find missing agents
  const missing = baiAgents.filter(a => !existingNames.has(a.name.toLowerCase()));
  console.log(`Step 3: Found ${missing.length} new agents to import\n`);

  if (missing.length === 0) {
    console.log('  All BAI agents already exist in AgentAnchor!\n');
  } else {
    // Get owner ID
    const ownerResult = await client.query('SELECT id FROM profiles LIMIT 1');
    const ownerId = ownerResult.rows[0]?.id;

    if (!ownerId) {
      console.error('  No owner found!');
      await client.end();
      return;
    }

    // Import missing agents
    console.log(`Step 4: Importing ${missing.length} new agents...\n`);
    let imported = 0;
    let errors = 0;

    for (const bai of missing) {
      try {
        const agent = convertAgent(bai, ownerId);

        if (!DRY_RUN) {
          await client.query(`
            INSERT INTO agents (
              owner_id, name, description, system_prompt, model,
              status, trust_score, config, metadata, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          `, [
            agent.owner_id, agent.name, agent.description, agent.system_prompt,
            agent.model, agent.status, agent.trust_score, agent.config, agent.metadata
          ]);
        }
        imported++;
        if (imported % 100 === 0) {
          console.log(`    Imported ${imported}/${missing.length}...`);
        }
      } catch (err) {
        errors++;
        if (errors <= 3) console.error(`    Error: ${bai.name}: ${err.message}`);
      }
    }
    console.log(`\n  ${DRY_RUN ? 'Would import' : 'Imported'}: ${imported}, Errors: ${errors}\n`);
  }

  // Step 5: Deduplicate
  console.log('Step 5: Checking for duplicates...\n');
  const dupes = await client.query(`
    SELECT SUM(count - 1) as total FROM (
      SELECT COUNT(*) as count FROM agents GROUP BY LOWER(name) HAVING COUNT(*) > 1
    ) sub
  `);
  const dupeCount = parseInt(dupes.rows[0].total || 0);
  console.log(`  Found ${dupeCount} duplicates\n`);

  if (dupeCount > 0 && !DRY_RUN) {
    const deleteResult = await client.query(`
      DELETE FROM agents WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(name) ORDER BY created_at ASC) as rn
          FROM agents
        ) sub WHERE rn > 1
      )
    `);
    console.log(`  Deleted ${deleteResult.rowCount} duplicates\n`);
  }

  // Final count
  console.log('Step 6: Final counts...\n');
  const finalCount = await client.query(`
    SELECT metadata->>'level' as level, COUNT(*) as count
    FROM agents
    GROUP BY metadata->>'level'
    ORDER BY metadata->>'level'
  `);
  finalCount.rows.forEach(r => console.log(`  ${r.level}: ${r.count}`));

  const total = await client.query('SELECT COUNT(*) FROM agents');
  console.log(`\n  Total agents: ${total.rows[0].count}`);

  await client.end();
}

run().catch(console.error);
