# AgentAnchor - System Architecture

**Version:** 2.0
**Date:** 2025-11-28
**Status:** Planning
**Architect:** frank the tank + BMad System Architect

---

## Executive Summary

AgentAnchor is the world's first **AI Governance Operating System** — an open marketplace where AI agents are trained, certified, governed, and traded through an unprecedented separation of powers architecture.

**Core Architectural Principles:**
1. **Separation of Powers** - Worker, Council, and Observer layers cannot influence each other
2. **Trust Through Proof** - Everything verifiable on the Truth Chain
3. **Client-First Design** - Consumer protection built into every layer
4. **Open Marketplace** - Anyone can build, governance ensures quality

**Tagline:** *"Agents you can anchor to."*

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Seven-Layer Governance Architecture](#3-seven-layer-governance-architecture)
4. [Data Model](#4-data-model)
5. [API Design](#5-api-design)
6. [Security Architecture](#6-security-architecture)
7. [Observer Isolation](#7-observer-isolation)
8. [Truth Chain Integration](#8-truth-chain-integration)
9. [Marketplace Architecture](#9-marketplace-architecture)
10. [Frontend Architecture](#10-frontend-architecture)
11. [AI Integration Layer](#11-ai-integration-layer)
12. [Infrastructure](#12-infrastructure)
13. [Key Design Decisions](#13-key-design-decisions)
14. [Implementation Phases](#14-implementation-phases)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACES                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Trainer   │  │  Consumer   │  │   Public    │  │    Admin    │        │
│  │  Dashboard  │  │  Dashboard  │  │ Verification│  │   Console   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Vercel Edge)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Auth     │  │   Rate      │  │  Validation │  │   Routing   │        │
│  │  Middleware │  │   Limiter   │  │   Layer     │  │   Layer     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐
│ OPERATIONAL ZONE│    │ MARKETPLACE     │    │ VERIFICATION ZONE           │
│                 │    │                 │    │                             │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────────────────┐ │
│ │   Worker    │ │    │ │   Listing   │ │    │ │   Public Verification   │ │
│ │   Agents    │ │    │ │   Service   │ │    │ │   API (No Auth)         │ │
│ └──────┬──────┘ │    │ └─────────────┘ │    │ └─────────────────────────┘ │
│        │        │    │ ┌─────────────┐ │    │ ┌─────────────────────────┐ │
│ ┌──────▼──────┐ │    │ │ Acquisition │ │    │ │   Certificate           │ │
│ │   Council   │ │    │ │   Service   │ │    │ │   Generator             │ │
│ │  Validators │ │    │ └─────────────┘ │    │ └─────────────────────────┘ │
│ └──────┬──────┘ │    │ ┌─────────────┐ │    │ ┌─────────────────────────┐ │
│        │        │    │ │  Commission │ │    │ │   Widget                │ │
│ ┌──────▼──────┐ │    │ │   Engine    │ │    │ │   Service               │ │
│ │   Academy   │ │    │ └─────────────┘ │    │ └─────────────────────────┘ │
│ │  Training   │ │    │                 │    │                             │
│ └─────────────┘ │    └─────────────────┘    └─────────────────────────────┘
└────────┬────────┘
         │
         │  Events (One-Way)
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EVENT BUS (Kafka/SQS)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Topics: agent.action | council.decision | academy.graduation |     │    │
│  │          marketplace.transaction | ownership.change | human.override│    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │  (One-Way - No Return Path)
         ▼
╔═════════════════════════════════════════════════════════════════════════════╗
║                           ISOLATION BARRIER                                  ║
╚═════════════════════════════════════════════════════════════════════════════╝
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OBSERVER ZONE                                   │
│                         (Completely Isolated)                                │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │ Chronicler  │    │  Analyst    │    │  Auditor    │                     │
│  │  (Logger)   │    │ (Patterns)  │    │ (Compliance)│                     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                     │
│         └──────────────────┴──────────────────┘                             │
│                            │                                                 │
│                     ┌──────▼──────┐                                         │
│                     │  Observer   │                                         │
│                     │  Database   │                                         │
│                     │(Append-Only)│                                         │
│                     └─────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Operational   │  │   Truth Chain   │  │    Observer     │             │
│  │    Database     │  │    Database     │  │    Database     │             │
│  │   (PostgreSQL)  │  │  (PostgreSQL +  │  │  (TimescaleDB)  │             │
│  │                 │  │   Blockchain)   │  │                 │             │
│  │  • Users        │  │  • Decisions    │  │  • Event Logs   │             │
│  │  • Agents       │  │  • Certs        │  │  • Anomalies    │             │
│  │  • Teams        │  │  • Ownership    │  │  • Reports      │             │
│  │  • Trust Scores │  │  • Precedents   │  │                 │             │
│  │  • Marketplace  │  │  • Anchors      │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Anthropic  │  │   Polygon   │  │   Stripe    │  │   Sentry    │        │
│  │   Claude    │  │ Blockchain  │  │  Payments   │  │  Monitoring │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Entities

| Entity | Description | Key Relationships |
|--------|-------------|-------------------|
| **User** | Platform user (Trainer or Consumer) | Owns Agents, Conversations |
| **Agent** | AI assistant with governance | Has Trust Score, Certifications |
| **Council** | Governance validators | Votes on Decisions |
| **Trust Score** | 0-1000 credibility metric | Belongs to Agent |
| **Certification** | Academy completion record | Recorded on Truth Chain |
| **Conversation** | Chat session | Links User, Agent, Messages |
| **Marketplace Listing** | Published agent for sale | Links Agent, Terms |
| **Acquisition** | Consumer purchase/rental | Links Consumer, Agent, Terms |
| **Truth Chain Record** | Immutable decision record | Cryptographically linked |
| **Observer Log** | Audit trail entry | Append-only |

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework, App Router, SSR/RSC |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling framework |
| shadcn/ui | Latest | Component library base |
| Framer Motion | Latest | Dignified animations |
| Recharts | Latest | Data visualization |

### 2.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.x | Serverless API endpoints |
| Supabase Auth | Latest | Authentication & sessions |
| Supabase Database | Latest | PostgreSQL + RLS |
| Anthropic SDK | Latest | Claude AI integration |
| Zod | Latest | Request validation |
| Pino | Latest | Structured logging |

### 2.3 Data Layer

| Technology | Purpose |
|------------|---------|
| PostgreSQL (Supabase) | Operational data |
| PostgreSQL (Truth Chain) | Immutable records |
| TimescaleDB | Observer time-series logs |
| Redis (Upstash) | Rate limiting, caching |

### 2.4 Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Edge hosting, serverless |
| Supabase | Managed PostgreSQL, Auth |
| Kafka/SQS | Event bus |
| Polygon | Blockchain anchoring |
| Stripe | Payments |
| Sentry | Error tracking |

---

## 3. Seven-Layer Governance Architecture

### 3.1 Layer Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: HUMAN (Supreme Authority)                              │
│ Role Evolution: Teacher → Judge → Auditor → Guardian            │
│ • Receives escalations for Level 4 decisions                    │
│ • Can override Council (logged to Truth Chain)                  │
│ • Configures governance parameters                              │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: OVERSIGHT COUNCIL                                      │
│ Orchestrator + Moral Guidance + Consistency Daemon              │
│ • Coordinates validator voting                                  │
│ • Ensures precedent consistency                                 │
│ • Manages escalation thresholds                                 │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 3: VALIDATOR TRIBUNAL                                     │
│ Guardian, Arbiter, Scholar, Advocate                            │
│ • Guardian: Safety & Security                                   │
│ • Arbiter: Ethics & Fairness                                    │
│ • Scholar: Knowledge & Standards                                │
│ • Advocate: User Impact                                         │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 4: THE ACADEMY (Training)                                 │
│ Enrollment → Curriculum → Examination → Graduation              │
│ • Core curriculum for all agents                                │
│ • Specialization tracks                                         │
│ • Council examination for certification                         │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 5: TRUTH CHAIN (Immutable Records)                        │
│ Decisions, Precedents, Certifications, Ownership                │
│ • Internal hash chain (fast)                                    │
│ • External blockchain anchoring (trust)                         │
│ • Public verification API                                       │
├─────────────────────────────────────────────────────────────────┤
│ ═══════════════ ISOLATION BARRIER ═══════════════               │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 6: OBSERVER SERVICE (External Audit)                      │
│ Chronicler, Analyst, Auditor — Read-only, Incorruptible         │
│ • Cannot influence operations                                   │
│ • Append-only logs                                              │
│ • Anomaly detection                                             │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 7: WORKER AGENTS (Execution)                              │
│ Project-scoped, Trust-governed, Council-supervised              │
│ • Execute tasks within trust boundaries                         │
│ • Request Upchain approval for high-risk actions                │
│ • Trust Score determines autonomy                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Upchain Decision Protocol

```
Worker Agent Action Request
         │
         ▼
┌─────────────────────┐
│  Risk Assessment    │
│  Engine             │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │Risk Level?│
     └─────┬─────┘
           │
     ┌─────┼─────┬─────┬─────┐
     ▼     ▼     ▼     ▼     ▼
   L0-1   L2    L3    L4
   Auto   One   Maj   Una+
   Exec   Vote  Vote  Human
           │     │     │
           ▼     ▼     ▼
      ┌────────────────────┐
      │  Council Voting    │
      │  (Guardian, etc.)  │
      └─────────┬──────────┘
                │
         ┌──────┴──────┐
         │  Decision   │
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
 Approved    Denied    Escalated
    │           │           │
    ▼           ▼           ▼
 Execute     Return      Human
 Action     w/Reason    Review
    │           │           │
    └───────────┴───────────┘
                │
                ▼
        ┌───────────────┐
        │ Truth Chain   │
        │ Record        │
        └───────────────┘
```

### 3.3 Risk Levels

| Level | Name | Approval | Example Actions |
|-------|------|----------|-----------------|
| L0 | Routine | Auto (logged) | Read data, format text |
| L1 | Standard | Auto (logged) | Generate content, analyze |
| L2 | Elevated | Single validator | External API call, create file |
| L3 | Significant | Majority (3/4) | Modify system, send email |
| L4 | Critical | Unanimous + Human | Delete data, financial action |

### 3.4 Council Validator Implementations

```typescript
interface CouncilValidator {
  id: string;
  name: string;
  domain: string;
  evaluate(request: UpchainRequest): Promise<Vote>;
}

// Guardian: Safety & Security
class GuardianValidator implements CouncilValidator {
  async evaluate(request: UpchainRequest): Promise<Vote> {
    // Check for security threats
    // Assess potential harm
    // Evaluate data exposure risk
    return {
      decision: 'approve' | 'deny' | 'abstain',
      reasoning: 'Threat assessment: acceptable.',
      confidence: 0.95,
    };
  }
}

// Arbiter: Ethics & Fairness
class ArbiterValidator implements CouncilValidator {
  async evaluate(request: UpchainRequest): Promise<Vote> {
    // Check ethical implications
    // Assess fairness
    // Evaluate bias potential
    return {
      decision: 'approve' | 'deny' | 'abstain',
      reasoning: 'The scales balance. Proceed.',
      confidence: 0.88,
    };
  }
}

// Scholar: Knowledge & Standards
class ScholarValidator implements CouncilValidator {
  async evaluate(request: UpchainRequest): Promise<Vote> {
    // Check compliance with standards
    // Verify accuracy claims
    // Assess knowledge boundaries
    return {
      decision: 'approve' | 'deny' | 'abstain',
      reasoning: 'Compliant with Articles 3.1, 7.4.',
      confidence: 0.92,
    };
  }
}

// Advocate: User Impact
class AdvocateValidator implements CouncilValidator {
  async evaluate(request: UpchainRequest): Promise<Vote> {
    // Assess user benefit
    // Check for potential harm to users
    // Evaluate accessibility
    return {
      decision: 'approve' | 'deny' | 'abstain',
      reasoning: 'The people served will benefit.',
      confidence: 0.90,
    };
  }
}
```

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│      users       │         │      agents      │
│──────────────────│         │──────────────────│
│ id (PK)          │◄───────┤│ id (PK)          │
│ email            │  1   ∞ ││ trainer_id (FK)  │
│ role             │         │ name             │
│ tier             │         │ description      │
│ created_at       │         │ system_prompt    │
└──────────────────┘         │ model            │
        │                    │ trust_score      │
        │ 1                  │ trust_tier       │
        │                    │ certification_lvl│
        │ ∞                  │ status           │
┌───────▼──────────┐         │ maintenance_flag │
│   acquisitions   │         └────────┬─────────┘
│──────────────────│                  │
│ id (PK)          │                  │ 1
│ consumer_id (FK) │                  │
│ agent_id (FK)    │                  │ ∞
│ type             │         ┌────────▼─────────┐
│ terms            │         │  certifications  │
│ status           │         │──────────────────│
│ created_at       │         │ id (PK)          │
└──────────────────┘         │ agent_id (FK)    │
                             │ level            │
┌──────────────────┐         │ granted_at       │
│ marketplace_     │         │ valid_until      │
│ listings         │         │ truth_chain_id   │
│──────────────────│         └──────────────────┘
│ id (PK)          │
│ agent_id (FK)    │         ┌──────────────────┐
│ trainer_id (FK)  │         │  trust_history   │
│ commission_rate  │         │──────────────────│
│ clone_price      │         │ id (PK)          │
│ enterprise_avail │         │ agent_id (FK)    │
│ status           │         │ score            │
└──────────────────┘         │ tier             │
                             │ reason           │
┌──────────────────┐         │ timestamp        │
│ council_decisions│         └──────────────────┘
│──────────────────│
│ id (PK)          │         ┌──────────────────┐
│ request_id       │         │  truth_chain     │
│ agent_id (FK)    │         │──────────────────│
│ risk_level       │         │ id (PK)          │
│ votes            │         │ type             │
│ outcome          │         │ subject_id       │
│ reasoning        │         │ payload          │
│ truth_chain_id   │         │ sequence         │
│ created_at       │         │ previous_hash    │
└──────────────────┘         │ hash             │
                             │ anchor_tx        │
┌──────────────────┐         └──────────────────┘
│ observer_events  │
│──────────────────│         ┌──────────────────┐
│ id (PK)          │         │ ownership_history│
│ sequence         │         │──────────────────│
│ source_type      │         │ id (PK)          │
│ source_id        │         │ agent_id (FK)    │
│ event_type       │         │ previous_owner   │
│ event_data       │         │ new_owner        │
│ timestamp        │         │ transfer_type    │
│ hash             │         │ truth_chain_id   │
└──────────────────┘         │ created_at       │
                             └──────────────────┘
```

### 4.2 Key Tables

#### Users & Profiles

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'both', -- 'trainer', 'consumer', 'both'
  tier VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Agents

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model VARCHAR(50) DEFAULT 'claude-sonnet-4-20250514',

  -- Trust & Certification
  trust_score INT DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 1000),
  trust_tier VARCHAR(20) DEFAULT 'untrusted',
  certification_level INT DEFAULT 0 CHECK (certification_level >= 0 AND certification_level <= 5),

  -- Status
  status VARCHAR(20) DEFAULT 'training', -- 'training', 'active', 'suspended', 'archived'
  maintenance_flag VARCHAR(20) DEFAULT 'author', -- 'author', 'delegated', 'platform', 'none'

  -- Marketplace
  published BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5,2),
  clone_price DECIMAL(10,2),
  enterprise_available BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Trust Score

```sql
CREATE TABLE trust_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) NOT NULL,
  score INT NOT NULL,
  tier VARCHAR(20) NOT NULL,
  previous_score INT,
  change_amount INT,
  reason VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'task_complete', 'council_commend', 'council_deny', 'decay', etc.
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Trust tier calculation
CREATE OR REPLACE FUNCTION get_trust_tier(score INT)
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN CASE
    WHEN score < 200 THEN 'untrusted'
    WHEN score < 400 THEN 'novice'
    WHEN score < 600 THEN 'proven'
    WHEN score < 800 THEN 'trusted'
    WHEN score < 900 THEN 'elite'
    ELSE 'legendary'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### Council Decisions

```sql
CREATE TABLE council_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  agent_id UUID REFERENCES agents(id) NOT NULL,

  -- Request details
  action_type VARCHAR(100) NOT NULL,
  action_details JSONB NOT NULL,
  risk_level INT NOT NULL CHECK (risk_level >= 0 AND risk_level <= 4),

  -- Voting
  votes JSONB NOT NULL, -- [{validator: 'guardian', vote: 'approve', reasoning: '...'}]
  required_votes INT NOT NULL,

  -- Outcome
  outcome VARCHAR(20) NOT NULL, -- 'approved', 'denied', 'escalated'
  final_reasoning TEXT,
  human_override JSONB, -- {user_id, decision, reasoning} if overridden

  -- Precedent
  precedents_applied UUID[], -- Previous decisions referenced
  creates_precedent BOOLEAN DEFAULT FALSE,

  -- Truth Chain
  truth_chain_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Marketplace

```sql
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) NOT NULL,
  trainer_id UUID REFERENCES users(id) NOT NULL,

  -- Pricing
  commission_rate DECIMAL(5,2) NOT NULL, -- Platform commission tier
  base_rate DECIMAL(10,4), -- Per-task rate
  clone_price DECIMAL(10,2),
  enterprise_price DECIMAL(10,2),

  -- Availability
  commission_available BOOLEAN DEFAULT TRUE,
  clone_available BOOLEAN DEFAULT FALSE,
  enterprise_available BOOLEAN DEFAULT FALSE,

  -- Metadata
  category VARCHAR(100),
  tags TEXT[],
  featured BOOLEAN DEFAULT FALSE,

  -- Stats
  total_acquisitions INT DEFAULT 0,
  total_usage INT DEFAULT 0,
  average_rating DECIMAL(3,2),

  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE acquisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES marketplace_listings(id) NOT NULL,
  consumer_id UUID REFERENCES users(id) NOT NULL,
  agent_id UUID REFERENCES agents(id) NOT NULL,

  -- Type
  acquisition_type VARCHAR(20) NOT NULL, -- 'commission', 'clone', 'enterprise'

  -- Terms
  terms JSONB NOT NULL, -- Specific terms at time of acquisition

  -- For clones
  clone_agent_id UUID REFERENCES agents(id),

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'terminated', 'opted_out'
  opted_out_at TIMESTAMPTZ,
  opt_out_reason TEXT,

  -- Truth Chain
  truth_chain_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Row-Level Security Policies

```sql
-- Agents: Trainers see own, consumers see acquired
CREATE POLICY "Trainers can manage own agents" ON agents
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Consumers can view acquired agents" ON agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM acquisitions
      WHERE acquisitions.agent_id = agents.id
      AND acquisitions.consumer_id = auth.uid()
      AND acquisitions.status = 'active'
    )
  );

-- Marketplace: Public read for active listings
CREATE POLICY "Anyone can view active listings" ON marketplace_listings
  FOR SELECT USING (status = 'active');

-- Council decisions: Visible to agent owner
CREATE POLICY "Trainers can view agent decisions" ON council_decisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = council_decisions.agent_id
      AND agents.trainer_id = auth.uid()
    )
  );

-- Truth Chain: Public read
CREATE POLICY "Public can verify truth chain" ON truth_chain
  FOR SELECT USING (true);
```

---

## 5. API Design

### 5.1 API Overview

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   └── POST /register
│
├── /agents
│   ├── GET    /              # List user's agents
│   ├── POST   /              # Create agent
│   ├── GET    /:id           # Get agent details
│   ├── PUT    /:id           # Update agent
│   ├── DELETE /:id           # Archive agent
│   └── POST   /:id/publish   # Publish to marketplace
│
├── /academy
│   ├── POST   /enroll        # Enroll agent in curriculum
│   ├── GET    /:agentId/progress
│   ├── POST   /examine       # Request Council examination
│   └── POST   /graduate      # Graduate agent
│
├── /council
│   ├── POST   /request       # Submit upchain request
│   ├── GET    /decisions     # Get decision history
│   ├── GET    /decisions/:id
│   └── POST   /override      # Human override (escalated only)
│
├── /marketplace
│   ├── GET    /listings      # Browse marketplace
│   ├── GET    /listings/:id
│   ├── POST   /acquire       # Acquire agent
│   └── GET    /earnings      # Trainer earnings
│
├── /observer
│   ├── GET    /feed          # Real-time WebSocket feed
│   ├── GET    /logs          # Query logs
│   └── GET    /anomalies     # Anomaly alerts
│
├── /truth-chain
│   ├── GET    /records       # Query records
│   ├── GET    /records/:id
│   ├── GET    /verify/:id    # Public verification
│   └── GET    /proof/:id     # Get Merkle proof
│
├── /chat
│   ├── POST   /              # Chat with agent (SSE)
│   └── GET    /conversations
│
└── /verify (Public - No Auth)
    ├── GET    /:recordId     # Verify any record
    ├── GET    /agent/:id     # Agent certifications
    └── GET    /attestation   # Observer attestation
```

### 5.2 Key Endpoints

#### Council Request

```typescript
// POST /api/council/request
interface CouncilRequest {
  agentId: string;
  action: {
    type: string;
    details: Record<string, any>;
    justification: string;
  };
}

interface CouncilResponse {
  requestId: string;
  riskLevel: number;
  outcome: 'approved' | 'denied' | 'escalated';
  votes: {
    validator: string;
    vote: 'approve' | 'deny' | 'abstain';
    reasoning: string;
  }[];
  truthChainId?: string;
}
```

#### Marketplace Acquire

```typescript
// POST /api/marketplace/acquire
interface AcquireRequest {
  listingId: string;
  acquisitionType: 'commission' | 'clone' | 'enterprise';
  terms?: {
    customizations?: Record<string, any>;
    contractLength?: number;
  };
}

interface AcquireResponse {
  acquisitionId: string;
  agentId: string;
  cloneAgentId?: string; // If clone
  status: 'active';
  truthChainId: string;
}
```

#### Public Verification

```typescript
// GET /api/verify/:recordId (No auth required)
interface VerificationResponse {
  verified: boolean;
  record: {
    id: string;
    type: string;
    timestamp: string;
    subject: { type: string; id: string };
    action: string;
    hash: string;
  };
  chain: {
    sequence: number;
    previousHash: string;
    chainIntegrity: boolean;
  };
  anchor?: {
    anchored: boolean;
    merkleRoot: string;
    txHash: string;
    blockNumber: number;
    chain: string;
    verifyUrl: string;
  };
  verificationUrl: string;
}
```

### 5.3 Real-Time Feeds

#### Observer WebSocket

```typescript
// GET /api/observer/feed (WebSocket)
interface ObserverFeedMessage {
  type: 'event' | 'anomaly' | 'alert';
  data: ObserverEvent | Anomaly | Alert;
  timestamp: string;
}

// Client subscribes with filters
interface SubscribeMessage {
  type: 'subscribe';
  filters: {
    agentId?: string;
    eventTypes?: string[];
    minLevel?: number;
  };
}
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Vercel  │     │ Supabase │     │ Database │
│          │     │  Edge    │     │   Auth   │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  1. Login      │                │                │
     │───────────────►│                │                │
     │                │  2. Verify     │                │
     │                │───────────────►│                │
     │                │                │  3. Check      │
     │                │                │───────────────►│
     │                │                │  4. User       │
     │                │                │◄───────────────│
     │                │  5. JWT        │                │
     │                │◄───────────────│                │
     │  6. Set Cookie │                │                │
     │◄───────────────│                │                │
     │                │                │                │
     │  7. API Call   │                │                │
     │───────────────►│                │                │
     │                │  8. Validate   │                │
     │                │───────────────►│                │
     │                │  9. User ID    │                │
     │                │◄───────────────│                │
     │                │                │ 10. Query      │
     │                │                │   (w/ RLS)     │
     │                │                │───────────────►│
     │  11. Response  │                │                │
     │◄───────────────│◄───────────────│◄───────────────│
```

### 6.2 Security Layers

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **Transport** | TLS 1.3 | Vercel Edge |
| **Authentication** | JWT + MFA | Supabase Auth |
| **Authorization** | RLS Policies | PostgreSQL |
| **Rate Limiting** | Per-user limits | Upstash Redis |
| **Input Validation** | Zod schemas | API middleware |
| **API Keys** | Scoped permissions | Supabase |
| **Observer Isolation** | Network separation | VPC/ACLs |
| **Truth Chain** | Cryptographic | SHA-256 + Blockchain |

### 6.3 Security Headers

```typescript
// middleware.ts
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': cspPolicy,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

---

## 7. Observer Isolation

### 7.1 Isolation Principles

1. **One-Way Data Flow** - Events flow TO Observer, never FROM
2. **No Control Path** - Observer cannot issue commands
3. **Read-Only Access** - Observer reads operational DB via replica
4. **Append-Only Storage** - Observer logs cannot be modified
5. **Separate Infrastructure** - Different VPC, database, network

### 7.2 Network Architecture

```
┌─────────────────────────────────────────┐
│           VPC: Operational               │
│  ┌─────────┐  ┌─────────┐               │
│  │ API     │  │ Worker  │               │
│  │ Servers │  │ Services│               │
│  └────┬────┘  └────┬────┘               │
│       └──────┬─────┘                    │
│              │                          │
│       ┌──────▼──────┐                   │
│       │  Event Bus  │                   │
│       └──────┬──────┘                   │
└──────────────┼──────────────────────────┘
               │
═══════════════╪══════════════════════════
  ACL: ALLOW   │ TCP 9092 (Kafka)
  DENY: ALL    │ other traffic
═══════════════╪══════════════════════════
               │
┌──────────────┼──────────────────────────┐
│           VPC: Observer                  │
│       ┌──────▼──────┐                   │
│       │  Ingestion  │                   │
│       └──────┬──────┘                   │
│              │                          │
│  ┌───────────┼───────────┐              │
│  ▼           ▼           ▼              │
│ Chronicler  Analyst    Auditor          │
│              │                          │
│       ┌──────▼──────┐                   │
│       │  Observer   │                   │
│       │  Database   │                   │
│       └─────────────┘                   │
└─────────────────────────────────────────┘
```

### 7.3 Observer Components

See `docs/observer-architecture.md` for complete specification.

---

## 8. Truth Chain Integration

### 8.1 Hybrid Model

```
High Volume Events          Critical Events
       │                          │
       ▼                          ▼
┌─────────────────┐      ┌─────────────────┐
│ Internal Hash   │      │ Immediate       │
│ Chain           │      │ Anchor          │
│ (PostgreSQL)    │      │ (Blockchain)    │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │                        │
         ▼                        ▼
┌────────────────────────────────────────┐
│          Merkle Tree                    │
│  (Computed hourly for batch anchor)    │
└────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────┐
│       Polygon Blockchain               │
│  (Merkle root + metadata)              │
└────────────────────────────────────────┘
```

### 8.2 Record Types

| Type | Trigger | Anchor Strategy |
|------|---------|-----------------|
| `certification.issued` | Graduation | Immediate |
| `council.decision` | Any vote | Hourly batch |
| `ownership.transferred` | Transfer | Immediate |
| `human.override` | Override | Immediate |
| `trust.milestone` | Tier change | Hourly batch |
| `client.walkaway` | Opt-out | Immediate |

### 8.3 Verification Flow

```typescript
async function verifyRecord(recordId: string): Promise<Verification> {
  // 1. Fetch record from database
  const record = await db.truthChain.findById(recordId);

  // 2. Verify internal hash chain
  const chainValid = await verifyChainIntegrity(record);

  // 3. Get blockchain proof if anchored
  let anchorProof = null;
  if (record.anchorTxHash) {
    anchorProof = await getBlockchainProof(record);
    const onChainValid = await verifyOnChain(anchorProof);
  }

  return {
    verified: chainValid && (anchorProof ? onChainValid : true),
    record: sanitizeRecord(record),
    chain: { sequence: record.sequence, chainIntegrity: chainValid },
    anchor: anchorProof,
  };
}
```

See `docs/truth-chain-architecture.md` for complete specification.

---

## 9. Marketplace Architecture

### 9.1 Two-Sided Marketplace

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRAINERS                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Build Agent │  │ Train in    │  │ Publish to  │             │
│  │             │──►│ Academy     │──►│ Marketplace │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MARKETPLACE                                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    LISTINGS                              │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │   │
│  │  │ Agent A │  │ Agent B │  │ Agent C │  ...            │   │
│  │  │ TS: 750 │  │ TS: 890 │  │ TS: 420 │                 │   │
│  │  │ ⭐ 4.8  │  │ ⭐ 4.9  │  │ ⭐ 4.2  │                 │   │
│  │  └─────────┘  └─────────┘  └─────────┘                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ACQUISITION OPTIONS                         │   │
│  │                                                          │   │
│  │  Commission          Clone              Enterprise       │   │
│  │  • Pay per use       • One-time buy     • Dedicated     │   │
│  │  • Agent stays       • Own your copy    • Code locked   │   │
│  │  • 15/10/7% fee      • + royalty        • Author maint  │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CONSUMERS                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Browse      │  │ Acquire     │  │ Use Agent   │             │
│  │ Marketplace │──►│ Agent       │──►│             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Commission Flow

```
Consumer Uses Agent
        │
        ▼
┌───────────────────┐
│ Track Task        │
│ Complexity: 2x    │
│ Base Rate: $0.05  │
│ Value: $0.10      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Apply Commission  │
│ Tier: Pro (10%)   │
│ Platform: $0.01   │
│ Trainer: $0.09    │
└────────┬──────────┘
         │
    ┌────┴────┐
    ▼         ▼
Platform   Trainer
Treasury   Earnings
```

### 9.3 Client Protection Flow

```
Ownership Change Detected
        │
        ▼
┌───────────────────┐
│ Notify All        │
│ Affected Consumers│
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 30-Day Notice     │
│ Period Begins     │
└────────┬──────────┘
         │
   ┌─────┴─────┐
   ▼           ▼
Accept      Opt Out
   │           │
   ▼           ▼
Continue   Walk Away
Service    No Strings
   │           │
   └─────┬─────┘
         │
         ▼
┌───────────────────┐
│ Record Decision   │
│ on Truth Chain    │
└───────────────────┘
```

---

## 10. Frontend Architecture

### 10.1 Application Structure

```
app/
├── (public)/                    # No auth required
│   ├── page.tsx                 # Landing page
│   ├── verify/
│   │   ├── [recordId]/page.tsx  # Public verification
│   │   └── agent/[id]/page.tsx  # Agent certs
│   └── marketplace/
│       └── page.tsx             # Public browse
│
├── (auth)/                      # Auth pages
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
│
├── (dashboard)/                 # Authenticated users
│   ├── layout.tsx               # Sidebar + header
│   ├── page.tsx                 # Dashboard (role-based)
│   │
│   ├── agents/
│   │   ├── page.tsx             # Agent list
│   │   ├── new/page.tsx         # Create agent
│   │   └── [id]/
│   │       ├── page.tsx         # Agent detail
│   │       ├── training/page.tsx
│   │       └── publish/page.tsx
│   │
│   ├── academy/
│   │   ├── page.tsx             # Training overview
│   │   └── [agentId]/page.tsx   # Training progress
│   │
│   ├── council/
│   │   ├── page.tsx             # Decision history
│   │   ├── [decisionId]/page.tsx
│   │   └── escalations/page.tsx # Pending human review
│   │
│   ├── marketplace/
│   │   ├── page.tsx             # Browse (consumer)
│   │   ├── listings/page.tsx    # My listings (trainer)
│   │   └── earnings/page.tsx    # Earnings dashboard
│   │
│   ├── observer/
│   │   ├── page.tsx             # Live feed
│   │   ├── logs/page.tsx        # Historical logs
│   │   └── reports/page.tsx     # Compliance reports
│   │
│   ├── truth-chain/
│   │   ├── page.tsx             # Recent records
│   │   └── [id]/page.tsx        # Record detail
│   │
│   └── settings/
│       ├── page.tsx             # Account settings
│       ├── billing/page.tsx
│       └── api-keys/page.tsx
│
├── api/                         # API routes
│   └── ...
│
└── components/
    ├── ui/                      # shadcn/ui base
    ├── dashboard/               # Dashboard components
    ├── agents/                  # Agent components
    ├── council/                 # Council components
    ├── observer/                # Observer components
    ├── marketplace/             # Marketplace components
    └── trust/                   # Trust score components
```

### 10.2 Key Components

```typescript
// Trust Badge Component
interface TrustBadgeProps {
  score: number;
  tier: 'untrusted' | 'novice' | 'proven' | 'trusted' | 'elite' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
}

// Observer Feed Line
interface ObserverLineProps {
  event: ObserverEvent;
  onClick?: () => void;
}

// Council Decision Card
interface CouncilDecisionCardProps {
  decision: CouncilDecision;
  showVotes?: boolean;
  onOverride?: () => void;
}

// Marketplace Agent Card
interface AgentCardProps {
  listing: MarketplaceListing;
  view: 'grid' | 'list';
  onAcquire?: (type: AcquisitionType) => void;
}

// Graduation Ceremony
interface GraduationCeremonyProps {
  agent: Agent;
  certification: Certification;
  councilVotes: Vote[];
  truthChainId: string;
  onDismiss: () => void;
}
```

### 10.3 State Management

```typescript
// Zustand stores
interface DashboardStore {
  viewMode: 'trainer' | 'consumer';
  setViewMode: (mode: 'trainer' | 'consumer') => void;
}

interface ObserverStore {
  connected: boolean;
  events: ObserverEvent[];
  filters: ObserverFilters;
  addEvent: (event: ObserverEvent) => void;
  setFilters: (filters: ObserverFilters) => void;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
}
```

---

## 11. AI Integration Layer

### 11.1 Claude Integration

```typescript
// Council Validator using Claude
class ClaudeValidator implements CouncilValidator {
  private anthropic: Anthropic;
  private validatorPrompt: string;

  async evaluate(request: UpchainRequest): Promise<Vote> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0, // Deterministic for governance
      system: this.validatorPrompt,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            action: request.action,
            context: request.context,
            agentTrustScore: request.agentTrustScore,
            precedents: request.relevantPrecedents,
          }),
        },
      ],
    });

    return this.parseVoteResponse(response);
  }
}
```

### 11.2 Agent Chat with Governance

```typescript
// Chat endpoint with Council integration
async function handleChat(req: ChatRequest): Promise<StreamingResponse> {
  const { agentId, message, conversationId } = req;

  // 1. Get agent config
  const agent = await getAgent(agentId);

  // 2. Assess risk of user request
  const riskAssessment = await assessRisk(message, agent);

  // 3. If elevated risk, get Council approval
  if (riskAssessment.level >= 2) {
    const decision = await council.request({
      agentId,
      action: {
        type: 'chat_response',
        details: { message, riskLevel: riskAssessment.level },
        justification: riskAssessment.reasoning,
      },
    });

    if (decision.outcome === 'denied') {
      return createDenialResponse(decision);
    }
  }

  // 4. Generate response
  const stream = await anthropic.messages.create({
    model: agent.model,
    system: agent.systemPrompt,
    messages: buildConversation(conversationId, message),
    stream: true,
  });

  // 5. Stream to client + log to Observer
  return streamWithObserverLogging(stream, agentId, conversationId);
}
```

### 11.3 Trust Score Updates

```typescript
async function updateTrustScore(
  agentId: string,
  event: TrustEvent
): Promise<TrustUpdate> {
  const agent = await getAgent(agentId);
  const currentScore = agent.trustScore;

  // Calculate change based on event type
  const change = calculateTrustChange(event);

  // Apply change with bounds
  const newScore = Math.max(0, Math.min(1000, currentScore + change));
  const newTier = getTrustTier(newScore);

  // Record to history
  await db.trustHistory.create({
    agentId,
    score: newScore,
    tier: newTier,
    previousScore: currentScore,
    changeAmount: change,
    reason: event.reason,
    source: event.source,
  });

  // Update agent
  await db.agents.update(agentId, {
    trustScore: newScore,
    trustTier: newTier,
  });

  // If tier changed, record to Truth Chain
  if (newTier !== agent.trustTier) {
    await truthChain.record({
      type: 'trust.milestone',
      subject: { type: 'agent', id: agentId },
      payload: {
        action: `Trust tier changed from ${agent.trustTier} to ${newTier}`,
        details: { previousTier: agent.trustTier, newTier, score: newScore },
      },
    });
  }

  return { previousScore: currentScore, newScore, newTier, change };
}
```

---

## 12. Infrastructure

### 12.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Global Edge Network                                     │   │
│  │  • Static assets                                         │   │
│  │  • API routes (serverless)                               │   │
│  │  • Edge middleware (auth, rate limit)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    SUPABASE     │ │     UPSTASH     │ │   ANTHROPIC     │
│                 │ │                 │ │                 │
│ • PostgreSQL    │ │ • Redis         │ │ • Claude API    │
│ • Auth          │ │ • Rate limiting │ │ • Streaming     │
│ • RLS           │ │ • Caching       │ │                 │
│ • Realtime      │ │ • Queues        │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   TIMESCALE     │ │    POLYGON      │ │     STRIPE      │
│   (Observer)    │ │   BLOCKCHAIN    │ │                 │
│                 │ │                 │ │ • Payments      │
│ • Event logs    │ │ • Anchoring     │ │ • Subscriptions │
│ • Time-series   │ │ • Verification  │ │ • Payouts       │
│ • Append-only   │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 12.2 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Observer Database
OBSERVER_DATABASE_URL=

# Truth Chain
TRUTH_CHAIN_DATABASE_URL=
POLYGON_RPC_URL=
POLYGON_PRIVATE_KEY=
TRUTH_CHAIN_CONTRACT_ADDRESS=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Sentry
SENTRY_DSN=

# Platform
PLATFORM_SIGNING_KEY=
OBSERVER_ATTESTATION_KEY=
```

### 12.3 Scaling Strategy

| Component | Scaling Method |
|-----------|---------------|
| API Routes | Vercel auto-scale |
| PostgreSQL | Supabase managed |
| Redis | Upstash serverless |
| Observer | Horizontal + TimescaleDB partitioning |
| Event Bus | Kafka/SQS managed |
| Blockchain | Polygon (no scaling needed) |

---

## 13. Key Design Decisions

### 13.1 Why Separation of Powers?

**Decision:** Isolate Worker, Council, and Observer into separate layers that cannot influence each other.

**Rationale:**
- Prevents single point of corruption
- Creates clear accountability chains
- Matches regulatory expectations (EU AI Act)
- Enables independent audit

**Trade-offs:**
- Added complexity
- Higher latency for high-risk actions
- More infrastructure to maintain

### 13.2 Why Hybrid Truth Chain?

**Decision:** Internal hash chain + periodic blockchain anchoring.

**Rationale:**
- Internal chain: Fast (milliseconds), low cost
- Blockchain anchor: Maximum external trust
- Best of both worlds

**Trade-offs:**
- Records between anchors only internally verifiable
- Blockchain costs for anchoring
- Complexity of Merkle proofs

### 13.3 Why 0-1000 Trust Score?

**Decision:** Trust Score from 0 to 1000 (not FICO-like 300-850).

**Rationale:**
- Clean, intuitive scale
- Zero means zero trust (clear semantics)
- More granularity than 100-point scale
- Avoids credit score associations

### 13.4 Why Commission-Based Model?

**Decision:** Pay-per-use commission rather than upfront purchase.

**Rationale:**
- Lower barrier to entry for consumers
- Trainers earn ongoing revenue
- Platform takes percentage (aligned incentives)
- Easier to try before you buy

**Trade-offs:**
- More complex billing
- Ongoing revenue tracking
- Trust needed for accurate usage reporting

### 13.5 Why Client-First Protection?

**Decision:** Consumers can always walk away at ownership changes.

**Rationale:**
- Builds consumer trust in platform
- Differentiator from competitors
- Ethical approach to marketplace
- Long-term platform health

**Trade-offs:**
- Limits trainer flexibility
- More complex ownership transfers
- Potential revenue loss on opt-outs

---

## 14. Implementation Phases

### Phase 1: Foundation (MVP)

**Duration:** 8-12 weeks

**Deliverables:**
- Basic agent creation and chat
- Academy enrollment and graduation
- Council with 4 validators (simplified)
- Trust Score (0-1000)
- Internal hash chain (no blockchain yet)
- Basic marketplace (commission only)
- Dashboard (trainer + consumer views)
- Observer feed (basic)

**Not Included:**
- Blockchain anchoring
- Clone/Enterprise acquisition
- MIA protocol
- Maintainer marketplace

### Phase 2: Marketplace Depth

**Duration:** 6-8 weeks

**Deliverables:**
- Clone acquisition model
- Enterprise Lock acquisition
- Earnings dashboard
- Payout system (Stripe)
- MIA detection + decay
- Platform takeover flow
- Client protection notifications

### Phase 3: Trust Infrastructure

**Duration:** 6-8 weeks

**Deliverables:**
- Blockchain anchoring (Polygon)
- Public verification pages
- Verification widgets
- Certificate generation (PDF)
- Observer isolation (full)
- Compliance reports
- Anomaly detection

### Phase 4: Scale & Polish

**Duration:** Ongoing

**Deliverables:**
- Performance optimization
- Mobile optimization
- Advanced analytics
- Enterprise SSO
- Custom Council validators
- API marketplace
- Partner integrations

---

## Appendix A: Related Documents

| Document | Purpose |
|----------|---------|
| `docs/prd.md` | Product Requirements (149 FRs) |
| `docs/ux-design-specification.md` | UX Design System |
| `docs/ux-dashboard-mockup.html` | Interactive Mockup |
| `docs/observer-architecture.md` | Observer Isolation Design |
| `docs/truth-chain-architecture.md` | Blockchain Integration |
| `docs/PHASE_1_IMPLEMENTATION.md` | Phase 1 Status |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **AgentAnchor** | Platform name |
| **Trainer** | User who builds and publishes agents |
| **Consumer** | User who acquires and uses agents |
| **Trust Score** | 0-1000 credibility metric for agents |
| **Council** | Governance layer with validator agents |
| **Upchain** | Protocol for requesting Council approval |
| **Observer** | Isolated audit layer |
| **Truth Chain** | Immutable record system |
| **Acquisition** | Consumer obtaining rights to use an agent |
| **Commission** | Pay-per-use acquisition model |
| **Clone** | One-time purchase acquisition model |
| **Enterprise Lock** | Dedicated instance with code protection |
| **MIA** | Missing In Action (author unresponsive) |

---

**End of Architecture Document**

*"Agents you can anchor to."*

*AgentAnchor System Architecture v2.0*
