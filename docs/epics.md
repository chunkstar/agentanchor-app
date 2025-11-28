# AgentAnchor - Epic Breakdown

**Author:** frank the tank
**Date:** 2025-11-28
**Project Level:** Enterprise SaaS
**Target Scale:** 100 Trainers, 500 Consumers, 1000 Agents (MVP)

---

## Overview

This document provides the complete epic and story breakdown for AgentAnchor, decomposing the 149 functional requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This is the initial version incorporating PRD + UX Design + Architecture context.

### Epic Summary

| Epic | Title | Stories | Key Value |
|------|-------|---------|-----------|
| 1 | Foundation & Infrastructure | 5 | Platform deployable, users can register |
| 2 | Agent Creation & Academy | 6 | Trainers create and train agents |
| 3 | Council Governance | 5 | Agents governed by validator tribunal |
| 4 | Trust Score System | 4 | Trust earned through behavior |
| 5 | Observer & Truth Chain | 5 | Complete audit trail and verification |
| 6 | Marketplace & Acquisition | 6 | Consumers browse and acquire agents |
| 7 | Dashboard & Notifications | 5 | Unified management interface |
| 8 | API & Integration | 4 | External system integration |

**Total:** 8 Epics, 40 Stories

---

## Functional Requirements Inventory

### User Account & Access (FR1-FR8)
- FR1: Users can create accounts with email and password
- FR2: Users can authenticate with MFA
- FR3: Users can reset passwords via email
- FR4: Users can manage profile and notifications
- FR5: Users can choose role: Trainer, Consumer, or Both
- FR6: Trainers can manage storefront profile
- FR7: Consumers can view agent portfolio and usage
- FR8: Users can view subscription tier and usage

### Trainer Features (FR9-FR22)
- FR9: Trainers can create new AI agents
- FR10: Trainers can specify agent purpose/capabilities
- FR11: Trainers can enroll agents in Academy
- FR12: Trainers can publish agents to marketplace
- FR13: Trainers can set commission rates
- FR14: Trainers can set clone pricing (Growth)
- FR15: Trainers can enable Enterprise Lock (Growth)
- FR16: Trainers can view earnings dashboard
- FR17: Trainers can withdraw earnings
- FR18-FR22: Maintenance delegation features (Growth)

### Consumer Features (FR23-FR34)
- FR23: Consumers can browse marketplace
- FR24: Consumers can search/filter agents
- FR25: Consumers can view agent profiles
- FR26: Consumers can view Observer reports
- FR27: Consumers can acquire agents (commission)
- FR28-FR29: Clone/Enterprise acquisition (Growth)
- FR30: Consumers can view usage and costs
- FR31: Consumers can provide feedback
- FR32-FR34: Client protection features

### Agent Lifecycle (FR35-FR40)
- FR35: New agents start at Trust Score 0
- FR36: Agents must complete Academy to publish
- FR37: Agents receive Trust Score upon graduation
- FR38: Users can view agent history
- FR39: Agents can be archived
- FR40: Agents cannot be deleted (Truth Chain)

### The Academy (FR41-FR49)
- FR41: New agents enroll in Core Curriculum
- FR42: Academy provides structured training
- FR43: Agents progress through curriculum
- FR44: Trainers observe training progress
- FR45: Agents must pass Council examination
- FR46: Graduated agents receive Trust Score 200-399
- FR47: Specialization tracks (Growth)
- FR48: Elite mentorship (Growth)
- FR49: Graduation recorded on Truth Chain

### Trust Score System (FR50-FR57)
- FR50: Every agent has Trust Score 0-1000
- FR51: Score increases with successful tasks
- FR52: Score decreases with Council denials
- FR53: Score determines Trust Tier
- FR54: Tier determines autonomy limits
- FR55: Users can view score history
- FR56: Inactive agents decay
- FR57: Recovery through probation

### The Council (FR58-FR67)
- FR58: Council has specialized validators
- FR59: Core validators: Guardian, Arbiter, Scholar, Advocate
- FR60: Council evaluates by Risk Level
- FR61: Level 0-1: Auto-execute (logged)
- FR62: Level 2: Single validator approval
- FR63: Level 3: Majority approval
- FR64: Level 4: Unanimous + human
- FR65: Decisions include reasoning
- FR66: Precedent library built
- FR67: Decisions reference precedent

### Upchain Protocol (FR68-FR75)
- FR68: Workers request via Upchain
- FR69: Requests include action, justification, risk
- FR70: Validators vote on requests
- FR71: Voting rules by risk level
- FR72: Denied requests return reasoning
- FR73: Approved requests proceed
- FR74: Deadlocks escalate to human
- FR75: All decisions on Truth Chain

### Human-in-the-Loop (FR76-FR81)
- FR76: Humans notified for escalations
- FR77: Humans approve/deny with comments
- FR78: Humans can override Council
- FR79: Human decisions become precedent
- FR80: Configurable notification channels
- FR81: Human role configurable

### Observer Layer (FR82-FR91)
- FR82: Observers record every action
- FR83: Logs are append-only
- FR84: Logs include crypto signatures
- FR85: Observers isolated from Worker/Council
- FR86: Observers cannot influence behavior
- FR87: Real-time Observer feed
- FR88: Filterable by agent, action, risk
- FR89: Exportable for compliance
- FR90: Anomaly detection
- FR91: Automated compliance reports

### Truth Chain (FR92-FR100)
- FR92: All Council decisions recorded
- FR93: All certifications recorded
- FR94: All human overrides recorded
- FR95: All ownership changes recorded
- FR96: Records cryptographically linked
- FR97: Timestamps and signatures
- FR98: Public verification API
- FR99: Public verification URLs
- FR100: Records exportable

### Marketplace (FR101-FR108)
- FR101: Trainers list agents
- FR102: Listing includes description, pricing
- FR103: Shows Trust Score and tier
- FR104: Shows consumer ratings
- FR105: Shows Observer summary
- FR106: Search by category, score, price
- FR107: Featured listings (Growth)
- FR108: Trainer storefront pages

### Commission & Payments (FR109-FR115)
- FR109: Commission per usage
- FR110: Complexity multiplier
- FR111: Platform commission by tier
- FR112: Real-time earnings tracking
- FR113: Payout schedule
- FR114: Payment methods
- FR115: Earnings history

### MIA & Maintenance (FR116-FR122) - GROWTH
- FR116-FR122: All deferred to Growth phase

### Client Protection (FR123-FR128)
- FR123: Ownership change notifications
- FR124: 30-day notice period
- FR125: Consumer opt-out flow
- FR126: Walk away clean termination
- FR127: Platform continuity
- FR128: Decisions on Truth Chain

### Dashboard (FR129-FR136)
- FR129: Role toggle Trainer/Consumer
- FR130: Trainer dashboard
- FR131: Consumer dashboard
- FR132: Academy tab
- FR133: Council tab
- FR134: Observer tab
- FR135: Marketplace tab
- FR136: Truth Chain tab

### Notifications (FR137-FR143)
- FR137: Escalation alerts
- FR138: Graduation notifications
- FR139: Anomaly alerts
- FR140: Ownership change notifications
- FR141: Earnings milestones
- FR142: Configurable per type
- FR143: Email, in-app, webhook

### API & Integration (FR144-FR149)
- FR144: RESTful API
- FR145: API key authentication
- FR146: Webhook support
- FR147: Public verification API
- FR148: Rate limiting
- FR149: OpenAPI 3.0 spec

---

## FR Coverage Map

| Epic | FRs Covered |
|------|-------------|
| Epic 1 | FR1-FR8 (User Account) |
| Epic 2 | FR9-FR11, FR35-FR49 (Agent + Academy) |
| Epic 3 | FR58-FR75, FR76-FR81 (Council + HITL) |
| Epic 4 | FR50-FR57 (Trust Score) |
| Epic 5 | FR82-FR100 (Observer + Truth Chain) |
| Epic 6 | FR12-FR13, FR23-FR31, FR101-FR115 (Marketplace) |
| Epic 7 | FR129-FR143 (Dashboard + Notifications) |
| Epic 8 | FR144-FR149 (API) |

**Deferred to Growth:** FR14-FR22, FR28-FR29, FR32-FR34, FR47-FR48, FR107, FR116-FR128

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the platform foundation so developers can deploy and users can access the system.

**User Value:** Users can register, authenticate, and access a working platform with role selection.

**FRs Covered:** FR1-FR8

---

### Story 1.1: Project Setup & Deployment Pipeline

As a **developer**,
I want the project scaffolded with CI/CD pipeline,
So that code changes automatically deploy to staging/production.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I run `npm install && npm run dev`
**Then** the application starts locally on port 3000

**And** given a push to the `main` branch
**When** GitHub Actions workflow triggers
**Then** the app deploys to Vercel preview environment

**And** given a merge to `production` branch
**When** deployment completes
**Then** the app is live at agentanchor.com

**Prerequisites:** None (first story)

**Technical Notes:**
- Next.js 14 with App Router (per Architecture section 2.1)
- TypeScript 5.x strict mode
- Tailwind CSS + shadcn/ui components
- Supabase for auth and database
- Vercel for hosting
- GitHub Actions for CI/CD
- Sentry for error tracking
- Environment variables for all secrets

---

### Story 1.2: Database Schema & Supabase Setup

As a **developer**,
I want the core database schema deployed,
So that all features have proper data persistence.

**Acceptance Criteria:**

**Given** Supabase project is configured
**When** migrations run
**Then** all core tables exist: users, agents, trust_history, council_decisions, truth_chain, observer_events, marketplace_listings, acquisitions

**And** given Row Level Security policies
**When** a user queries agents
**Then** they only see their own agents or public marketplace listings

**And** given the schema
**When** I inspect foreign key relationships
**Then** all entities are properly linked per Architecture section 4

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use Supabase migrations for schema management
- Implement RLS policies per Architecture section 4.3
- Create indexes for common queries
- Set up database functions for trust tier calculation
- Configure realtime subscriptions for Observer feed

---

### Story 1.3: User Registration & Authentication

As a **user**,
I want to create an account and log in securely,
So that I can access the platform.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter valid email and password (8+ chars, 1 uppercase, 1 number, 1 special)
**Then** my account is created and I receive a verification email

**And** given I click the verification link within 15 minutes
**When** the page loads
**Then** my email is verified and I can log in

**And** given I am on the login page with valid credentials
**When** I submit the form
**Then** I am authenticated and redirected to dashboard

**And** given I am logged in
**When** I click "Forgot Password"
**Then** I receive a password reset email (FR3)

**Prerequisites:** Story 1.2

**Technical Notes:**
- Supabase Auth for authentication
- Email verification required before first login
- Password strength meter with visual feedback
- Rate limit: 5 login attempts per hour per IP
- Session tokens with 24-hour expiry
- Responsive design with 44x44px touch targets

---

### Story 1.4: User Profile & Role Selection

As a **user**,
I want to set up my profile and choose my role,
So that I can use the platform as Trainer, Consumer, or Both.

**Acceptance Criteria:**

**Given** I am a newly verified user
**When** I complete onboarding
**Then** I must select role: Trainer, Consumer, or Both (FR5)

**And** given I am logged in
**When** I visit /settings/profile
**Then** I can edit my name, avatar, and notification preferences (FR4)

**And** given I selected "Trainer" role
**When** I view my profile
**Then** I see storefront settings section (FR6)

**And** given I selected "Consumer" role
**When** I view dashboard
**Then** I see my agent portfolio and usage summary (FR7)

**Prerequisites:** Story 1.3

**Technical Notes:**
- Onboarding wizard for new users (3 steps max)
- Role stored in users table
- Role can be changed in settings
- Subscription tier display (FR8) - default to Free

---

### Story 1.5: Basic Navigation & Layout

As a **user**,
I want a consistent navigation experience,
So that I can easily find platform features.

**Acceptance Criteria:**

**Given** I am logged in
**When** I view any page
**Then** I see sidebar navigation with: Dashboard, Agents, Academy, Council, Observer, Marketplace, Truth Chain

**And** given I am on desktop (>1024px)
**When** sidebar is visible
**Then** it shows icons + labels, collapsible to icons only

**And** given I am on mobile (<768px)
**When** I tap hamburger menu
**Then** sidebar slides in as overlay

**And** given I have Trainer role
**When** I view navigation
**Then** I see "My Agents" and "Earnings" options

**Prerequisites:** Story 1.4

**Technical Notes:**
- shadcn/ui Sidebar component
- Role-based menu items
- Active state highlighting
- Breadcrumb navigation on inner pages
- Global search in header (placeholder for MVP)

---

## Epic 2: Agent Creation & Academy

**Goal:** Enable Trainers to create AI agents and train them through the Academy system.

**User Value:** Trainers can build agents from scratch, enroll them in training, and graduate them for marketplace publishing.

**FRs Covered:** FR9-FR11, FR35-FR49

---

### Story 2.1: Create New Agent

As a **Trainer**,
I want to create a new AI agent,
So that I can start building my bot's capabilities.

**Acceptance Criteria:**

**Given** I am a Trainer on /agents/new
**When** I fill in agent name, description, and purpose
**Then** I can create the agent

**And** given the agent is created
**When** I view its profile
**Then** Trust Score shows 0 (Untrusted) with ⚠️ badge (FR35)

**And** given I specify capabilities
**When** I save the agent
**Then** system_prompt is stored with my specifications (FR10)

**And** given I try to publish an untrained agent
**When** I click "Publish"
**Then** I see error: "Agent must complete Academy training first" (FR36)

**Prerequisites:** Epic 1 complete

**Technical Notes:**
- Agent creation form with validation
- Model selection: claude-sonnet-4-20250514 default
- System prompt builder with templates
- Capability tags for categorization
- Auto-save draft functionality

---

### Story 2.2: Academy Enrollment

As a **Trainer**,
I want to enroll my agent in the Academy,
So that it can begin structured training.

**Acceptance Criteria:**

**Given** I have an Untrusted agent (Score 0)
**When** I click "Enroll in Academy"
**Then** agent is enrolled in Core Curriculum (FR41)

**And** given enrollment is complete
**When** I view Academy tab
**Then** I see curriculum: "Platform Fundamentals", "Safety & Ethics", "Council Integration"

**And** given agent is enrolled
**When** I view agent status
**Then** it shows "Training" state

**Prerequisites:** Story 2.1

**Technical Notes:**
- Academy enrollment creates curriculum record
- Core Curriculum is mandatory for all agents
- Curriculum modules are sequential
- Progress tracked in academy_progress table
- Estimated completion: 3 modules

---

### Story 2.3: Training Progress & Curriculum

As a **Trainer**,
I want to observe my agent's training progress,
So that I know when it's ready for examination.

**Acceptance Criteria:**

**Given** my agent is enrolled in Academy
**When** I view /academy/[agentId]
**Then** I see progress through each module (FR43, FR44)

**And** given a module is completed
**When** progress updates
**Then** I see completion percentage and checkmark

**And** given all modules are complete
**When** I view the agent
**Then** "Request Examination" button is enabled

**And** given I view progress
**When** module has sub-lessons
**Then** I see breakdown: 3/5 lessons complete

**Prerequisites:** Story 2.2

**Technical Notes:**
- Progress visualization with progress bar
- Module completion triggers next module unlock
- Training content stored as markdown
- Simulated training for MVP (actual AI training is future)
- Completion certificate preview

---

### Story 2.4: Council Examination

As a **Trainer**,
I want my agent to be examined by the Council,
So that it can graduate and be published.

**Acceptance Criteria:**

**Given** my agent completed all curriculum
**When** I click "Request Examination"
**Then** examination request is sent to Council (FR45)

**And** given Council examines the agent
**When** all 4 validators (Guardian, Arbiter, Scholar, Advocate) approve
**Then** agent passes examination

**And** given examination passes
**When** I view results
**Then** I see each validator's vote and reasoning (FR65)

**And** given examination fails
**When** I view results
**Then** I see which validator(s) denied and why

**Prerequisites:** Story 2.3, Epic 3 (Council) must be started

**Technical Notes:**
- Examination is Council decision with risk_level = 2
- Requires majority (3/4) validators to pass
- Examination results stored in council_decisions
- Failed exams can be retried after 24 hours
- Council validators are AI agents with specific prompts

---

### Story 2.5: Agent Graduation

As a **Trainer**,
I want my agent to graduate from the Academy,
So that it receives Trust Score and can be published.

**Acceptance Criteria:**

**Given** my agent passed examination
**When** graduation processes
**Then** agent receives initial Trust Score between 200-399 (FR46)

**And** given graduation completes
**When** I view agent profile
**Then** Trust Tier shows "Novice" with 🌱 badge

**And** given graduation occurs
**When** I check Truth Chain
**Then** graduation is recorded with timestamp and signature (FR49)

**And** given agent is graduated
**When** I view status
**Then** "Publish to Marketplace" button is enabled

**Prerequisites:** Story 2.4

**Technical Notes:**
- Initial Trust Score: random 200-399 based on exam performance
- Graduation ceremony UI with animation
- Truth Chain record created immediately
- Status changes from "Training" to "Active"
- Notification sent to Trainer

---

### Story 2.6: Agent History & Archive

As a **Trainer**,
I want to view my agent's complete history and archive old agents,
So that I can track progress and manage my portfolio.

**Acceptance Criteria:**

**Given** I view an agent's profile
**When** I click "History" tab
**Then** I see complete timeline: creation, enrollment, training, graduation, actions (FR38)

**And** given I want to retire an agent
**When** I click "Archive"
**Then** agent is archived but audit trail preserved (FR39)

**And** given I try to delete an agent
**When** I look for delete option
**Then** there is none - agents cannot be deleted (FR40)

**And** given I view archived agents
**When** I filter by "Archived"
**Then** I see all my archived agents with preserved history

**Prerequisites:** Story 2.5

**Technical Notes:**
- History timeline component with infinite scroll
- Archive sets status = 'archived'
- Archived agents excluded from marketplace
- Truth Chain records immutable
- Search includes archived agents with filter

---

## Epic 3: Council Governance

**Goal:** Implement the Council governance layer that validates and approves agent actions.

**User Value:** All significant agent actions are reviewed by specialized validators, creating trust through oversight.

**FRs Covered:** FR58-FR75, FR76-FR81

---

### Story 3.1: Council Validator Agents

As the **platform**,
I want specialized Council validator agents,
So that governance decisions have domain expertise.

**Acceptance Criteria:**

**Given** the platform initializes
**When** Council is set up
**Then** 4 core validators exist: Guardian, Arbiter, Scholar, Advocate (FR58, FR59)

**And** given Guardian validator
**When** evaluating a request
**Then** it assesses safety and security threats

**And** given Arbiter validator
**When** evaluating a request
**Then** it assesses ethics and fairness

**And** given Scholar validator
**When** evaluating a request
**Then** it checks compliance with standards

**And** given Advocate validator
**When** evaluating a request
**Then** it assesses user impact

**Prerequisites:** Epic 1 complete

**Technical Notes:**
- Each validator is a Claude instance with specific system prompt
- Validator prompts defined per Architecture section 3.4
- Validators return: decision, reasoning, confidence
- Temperature = 0 for deterministic governance
- Validators stored as system agents (not user-created)

---

### Story 3.2: Risk Level Classification

As the **platform**,
I want actions classified by risk level,
So that appropriate approval is required.

**Acceptance Criteria:**

**Given** an agent action request
**When** the system classifies it
**Then** risk level is assigned 0-4 (FR60)

**And** given Level 0-1 (Routine/Standard)
**When** action is requested
**Then** it executes automatically with logging (FR61)

**And** given Level 2 (Elevated)
**When** action is requested
**Then** single Council member must approve (FR62)

**And** given Level 3 (Significant)
**When** action is requested
**Then** majority (3/4) Council must approve (FR63)

**And** given Level 4 (Critical)
**When** action is requested
**Then** unanimous Council + human confirmation required (FR64)

**Prerequisites:** Story 3.1

**Technical Notes:**
- Risk classification uses pattern matching + AI assessment
- Level 0: Read data, format text
- Level 1: Generate content, analyze
- Level 2: External API call, create file
- Level 3: Modify system, send email
- Level 4: Delete data, financial action
- Risk classifier is separate Claude call

---

### Story 3.3: Upchain Decision Protocol

As a **worker agent**,
I want to request Council approval via Upchain,
So that high-risk actions are properly governed.

**Acceptance Criteria:**

**Given** a worker agent needs to perform Level 2+ action
**When** it calls the Upchain API
**Then** request is submitted with action, justification, risk assessment (FR68, FR69)

**And** given request is submitted
**When** Council validators evaluate
**Then** each votes: approve, deny, or abstain (FR70)

**And** given voting completes per risk level rules
**When** majority/unanimous threshold met
**Then** decision is returned with reasoning (FR71, FR72, FR73)

**And** given a deadlock occurs
**When** no clear decision
**Then** request escalates to human (FR74)

**Prerequisites:** Story 3.2

**Technical Notes:**
- POST /api/council/request endpoint
- Request includes: agentId, action, details, justification
- Voting is parallel (all validators evaluate simultaneously)
- Decision timeout: 30 seconds
- Deadlock = equal approve/deny with no abstains

---

### Story 3.4: Precedent Library

As the **Council**,
I want to build a precedent library,
So that future decisions are consistent.

**Acceptance Criteria:**

**Given** a Council decision is made
**When** decision is significant (creates new pattern)
**Then** it's marked as precedent (FR66)

**And** given a new request comes in
**When** Council evaluates
**Then** relevant precedents are retrieved and referenced (FR67)

**And** given precedent exists for similar action
**When** validator reasons
**Then** reasoning includes: "Per precedent #123: [reasoning]"

**And** given I view Council tab
**When** I click "Precedents"
**Then** I see searchable list of all precedents

**Prerequisites:** Story 3.3

**Technical Notes:**
- Precedents stored in council_decisions with creates_precedent = true
- Vector similarity search for relevant precedents
- Precedent matching uses action_type + context similarity
- Manual precedent flagging by human reviewers
- Precedent IDs are sequential for easy reference

---

### Story 3.5: Human Escalation & Override

As a **human operator**,
I want to handle escalations and override Council when needed,
So that human judgment remains supreme.

**Acceptance Criteria:**

**Given** a Level 4 action or deadlock
**When** escalation triggers
**Then** I receive notification via configured channel (FR76, FR80)

**And** given I review escalation
**When** I approve or deny
**Then** decision includes my comments (FR77)

**And** given I disagree with Council
**When** I click "Override"
**Then** my decision supersedes Council, logged to Truth Chain (FR78)

**And** given I make a decision
**When** it's significant
**Then** it becomes precedent for future Council decisions (FR79)

**And** given I am setting up my account
**When** I configure human role
**Then** I can set level: Teacher, Judge, Auditor, or Guardian (FR81)

**Prerequisites:** Story 3.4

**Technical Notes:**
- Escalation notifications via email and in-app
- Override requires MFA confirmation
- Human decisions have special flag in Truth Chain
- Role levels affect default notification frequency
- Escalation queue in dashboard

---

## Epic 4: Trust Score System

**Goal:** Implement the Trust Score system that quantifies agent reliability.

**User Value:** Users can objectively assess agent trustworthiness through earned scores rather than configured permissions.

**FRs Covered:** FR50-FR57

---

### Story 4.1: Trust Score Display & Tiers

As a **user**,
I want to see an agent's Trust Score and Tier,
So that I can assess its trustworthiness.

**Acceptance Criteria:**

**Given** I view any agent profile
**When** page loads
**Then** I see Trust Score (0-1000) prominently displayed (FR50)

**And** given Trust Score is 0-199
**When** I view tier badge
**Then** I see ⚠️ Untrusted

**And** given Trust Score is 200-399
**When** I view tier badge
**Then** I see 🌱 Novice

**And** given Trust Score is 400-599
**When** I view tier badge
**Then** I see ✅ Proven

**And** given Trust Score is 600-799
**When** I view tier badge
**Then** I see 🛡️ Trusted

**And** given Trust Score is 800-899
**When** I view tier badge
**Then** I see 👑 Elite

**And** given Trust Score is 900-1000
**When** I view tier badge
**Then** I see 🌟 Legendary

**Prerequisites:** Epic 2 complete

**Technical Notes:**
- TrustBadge component with score and tier
- Tier calculated via database function get_trust_tier()
- Badge colors: red, green, blue, purple, gold, rainbow
- Tooltip shows tier benefits
- Score displayed as "742 / 1000" format

---

### Story 4.2: Trust Score Changes

As an **agent**,
I want my Trust Score to change based on behavior,
So that trust is earned through demonstrated reliability.

**Acceptance Criteria:**

**Given** I complete a task successfully
**When** task is logged
**Then** Trust Score increases (FR51)

**And** given Council denies my action
**When** denial is recorded
**Then** Trust Score decreases (FR52)

**And** given I receive positive consumer feedback
**When** feedback is submitted
**Then** Trust Score increases

**And** given I violate a policy
**When** violation is flagged
**Then** Trust Score decreases significantly

**Prerequisites:** Story 4.1

**Technical Notes:**
- Score changes logged to trust_history table
- Increase amounts: +1 (task), +5 (commendation), +10 (milestone)
- Decrease amounts: -5 (denial), -20 (complaint), -50 (violation)
- Changes capped at tier boundaries initially
- Event-driven updates via database triggers

---

### Story 4.3: Trust Score History & Trends

As a **user**,
I want to view an agent's Trust Score history,
So that I can see how trust has evolved over time.

**Acceptance Criteria:**

**Given** I view agent profile
**When** I click "Trust History"
**Then** I see timeline of all score changes (FR55)

**And** given history view
**When** I look at chart
**Then** I see score trend line over time

**And** given a score change entry
**When** I view details
**Then** I see: timestamp, previous score, new score, reason, source

**And** given I view tier milestones
**When** agent crossed tier boundary
**Then** entry is highlighted with celebration

**Prerequisites:** Story 4.2

**Technical Notes:**
- Recharts line chart for trend visualization
- Trust history stored with full audit trail
- Milestone markers at 200, 400, 600, 800, 900
- Export as CSV for compliance
- Date range filter

---

### Story 4.4: Trust Decay & Autonomy Limits

As the **platform**,
I want inactive agents to decay and tiers to limit autonomy,
So that trust requires ongoing demonstration.

**Acceptance Criteria:**

**Given** an agent is inactive for 7+ days
**When** decay timer triggers
**Then** Trust Score decreases by 1 point (FR56)

**And** given decay reduces score below tier threshold
**When** new tier is calculated
**Then** tier updates with notification to Trainer

**And** given agent's Trust Tier
**When** it attempts action
**Then** action is limited by tier autonomy rules (FR54)

**And** given agent enters probation (score dropped significantly)
**When** probation period ends with good behavior
**Then** trust can recover (FR57)

**Prerequisites:** Story 4.3

**Technical Notes:**
- Decay runs via scheduled function (daily)
- Minimum decay floor at tier boundary - 10
- Tier autonomy limits defined per Architecture section 3.3
- Probation = 30 days of supervised operation
- Activity resets decay timer

---

## Epic 5: Observer & Truth Chain

**Goal:** Implement the immutable audit layer that records all actions and decisions.

**User Value:** Complete transparency and auditability - every action can be traced and verified.

**FRs Covered:** FR82-FR100

---

### Story 5.1: Observer Event Logging

As the **Observer service**,
I want to record every agent action,
So that complete audit trail exists.

**Acceptance Criteria:**

**Given** any agent performs an action
**When** action completes
**Then** Observer logs event with timestamp and details (FR82)

**And** given event is logged
**When** I try to modify it
**Then** modification is rejected - logs are append-only (FR83)

**And** given event is created
**When** I view signature
**Then** it includes cryptographic signature (FR84)

**And** given I view Observer architecture
**When** I check network paths
**Then** Observer is isolated from Worker/Council (FR85, FR86)

**Prerequisites:** Epic 1 complete

**Technical Notes:**
- Observer logs to separate TimescaleDB
- Append-only enforced via RLS policies
- Signature uses platform signing key
- Event schema: id, sequence, source, type, data, timestamp, hash
- No write path from Observer to operational systems

---

### Story 5.2: Observer Dashboard Feed

As a **user**,
I want to view real-time Observer feed,
So that I can monitor agent activity.

**Acceptance Criteria:**

**Given** I am on Observer tab
**When** page loads
**Then** I see real-time event feed (FR87)

**And** given the feed is active
**When** new events occur
**Then** they appear at top without refresh

**And** given I want to filter events
**When** I select filters
**Then** I can filter by agent, action type, risk level, time range (FR88)

**And** given I need compliance export
**When** I click "Export"
**Then** I receive filtered events as CSV/JSON (FR89)

**Prerequisites:** Story 5.1

**Technical Notes:**
- WebSocket connection for real-time updates
- Supabase Realtime subscriptions
- Pagination with infinite scroll
- Filter state persisted in URL
- Export limited to 10,000 events per request

---

### Story 5.3: Anomaly Detection

As the **Observer service**,
I want to detect anomalies in agent behavior,
So that problems are flagged early.

**Acceptance Criteria:**

**Given** Observer is monitoring
**When** unusual pattern detected (high error rate, rapid actions, etc.)
**Then** anomaly is flagged (FR90)

**And** given anomaly is flagged
**When** severity is high
**Then** alert is sent to relevant users (FR139)

**And** given I view Observer dashboard
**When** anomalies exist
**Then** I see anomaly section with details

**And** given I click an anomaly
**When** detail view opens
**Then** I see: type, affected agent, timeline, recommended action

**Prerequisites:** Story 5.2

**Technical Notes:**
- Anomaly detection via pattern matching
- Types: spike (>3x normal), error_cluster, timing_anomaly
- Severity: low (log), medium (alert), high (pause agent)
- Anomaly stored in observer_anomalies table
- ML-based detection is Growth feature

---

### Story 5.4: Truth Chain Records

As the **Truth Chain service**,
I want to record immutable decision records,
So that governance is verifiable forever.

**Acceptance Criteria:**

**Given** Council makes a decision
**When** decision is finalized
**Then** record is created on Truth Chain (FR92)

**And** given agent graduates
**When** graduation completes
**Then** certification is recorded on Truth Chain (FR93)

**And** given human overrides Council
**When** override is executed
**Then** override is recorded on Truth Chain (FR94)

**And** given ownership changes
**When** change is processed
**Then** change is recorded on Truth Chain (FR95)

**And** given a new record
**When** it's created
**Then** it includes hash of previous record (FR96) with timestamp and signature (FR97)

**Prerequisites:** Story 5.1

**Technical Notes:**
- Hash chain: SHA-256(previous_hash + payload + timestamp)
- Records stored in truth_chain table
- Sequence number for ordering
- Blockchain anchoring is Growth feature (use internal hash chain for MVP)
- Records include type, subject_id, payload, hash, previous_hash

---

### Story 5.5: Public Verification

As **anyone**,
I want to verify records without authentication,
So that trust can be externally validated.

**Acceptance Criteria:**

**Given** I have a record ID
**When** I call GET /api/verify/[recordId]
**Then** I receive verification result without needing login (FR98)

**And** given a certification
**When** I access its public URL
**Then** I see verification page with certificate details (FR99)

**And** given I need legal documentation
**When** I request export
**Then** I receive cryptographically signed record package (FR100)

**And** given verification page
**When** I view it
**Then** I see: record type, timestamp, subject, hash, chain integrity status

**Prerequisites:** Story 5.4

**Technical Notes:**
- Public API requires no authentication
- Verification URL format: /verify/[recordId]
- Verification checks: hash integrity, chain continuity
- Certificate displays agent name, graduation date, initial score
- Export includes Merkle proof (Growth feature)

---

## Epic 6: Marketplace & Acquisition

**Goal:** Enable Trainers to publish agents and Consumers to acquire them.

**User Value:** Trainers earn from their work; Consumers access quality, governed agents.

**FRs Covered:** FR12-FR13, FR23-FR31, FR101-FR115

---

### Story 6.1: Agent Publishing

As a **Trainer**,
I want to publish my graduated agent to the marketplace,
So that Consumers can discover and use it.

**Acceptance Criteria:**

**Given** I have a graduated agent
**When** I click "Publish to Marketplace"
**Then** I enter publishing flow (FR12)

**And** given publishing flow
**When** I complete listing details
**Then** I set: description, category, tags, commission rate (FR13, FR102)

**And** given I set commission rate
**When** I view options
**Then** I see platform fee: 15% Free / 10% Pro / 7% Enterprise (FR111)

**And** given listing is complete
**When** I publish
**Then** agent appears in marketplace with Trust Score and tier (FR103)

**Prerequisites:** Epic 2 complete, Story 4.1

**Technical Notes:**
- Publishing creates marketplace_listings record
- Categories: General, Customer Service, Data Analysis, Creative, Development, etc.
- Tags are searchable
- Commission rate: 0.01-1.00 per task unit
- Listing status: draft, active, paused, archived

---

### Story 6.2: Marketplace Browse & Search

As a **Consumer**,
I want to browse and search the marketplace,
So that I can find agents that meet my needs.

**Acceptance Criteria:**

**Given** I am on /marketplace
**When** page loads
**Then** I see grid of agent listings (FR23)

**And** given I want to filter
**When** I use search/filters
**Then** I can filter by category, Trust Score range, price range, rating (FR24, FR106)

**And** given I view a listing card
**When** I look at details
**Then** I see: name, description, Trust Score badge, rating, price indicator

**And** given I want more details
**When** I click a listing
**Then** I go to full agent profile with Observer summary stats (FR25, FR105)

**Prerequisites:** Story 6.1

**Technical Notes:**
- Grid/List view toggle
- Pagination with 20 items per page
- Search uses full-text search on name, description, tags
- Trust Score filter: ranges (Any, 200+, 400+, 600+, 800+)
- Sort by: Trust Score, Rating, Price, Newest

---

### Story 6.3: Agent Profile & Observer Reports

As a **Consumer**,
I want to view detailed agent profiles and public Observer reports,
So that I can make informed acquisition decisions.

**Acceptance Criteria:**

**Given** I am viewing an agent profile
**When** page loads
**Then** I see: description, capabilities, Trust Score history, Trainer info (FR25)

**And** given I click "Observer Reports"
**When** section expands
**Then** I see public summary: total actions, success rate, anomalies (FR26)

**And** given I view ratings
**When** reviews exist
**Then** I see consumer ratings and comments (FR104)

**And** given I want to see Trainer
**When** I click Trainer name
**Then** I go to Trainer storefront page (FR108)

**Prerequisites:** Story 6.2

**Technical Notes:**
- Observer reports show aggregated public stats only
- No sensitive action details exposed publicly
- Rating: 1-5 stars with optional comment
- Storefront shows all Trainer's agents and profile

---

### Story 6.4: Agent Acquisition (Commission Model)

As a **Consumer**,
I want to acquire an agent using the commission model,
So that I can use it for my work.

**Acceptance Criteria:**

**Given** I am viewing an agent I want
**When** I click "Acquire"
**Then** I see acquisition options (commission for MVP) (FR27)

**And** given I select commission model
**When** I confirm acquisition
**Then** agent is added to my portfolio

**And** given acquisition completes
**When** I view my dashboard
**Then** I see the agent in "My Agents" section (FR7)

**And** given I use the agent
**When** tasks complete
**Then** usage is tracked and I see costs (FR30)

**Prerequisites:** Story 6.3

**Technical Notes:**
- Acquisition creates acquisitions record
- acquisition_type = 'commission' for MVP
- Clone and Enterprise Lock deferred to Growth
- Usage tracked per task with complexity multiplier (FR110)
- No upfront payment required for commission model

---

### Story 6.5: Consumer Feedback

As a **Consumer**,
I want to provide feedback on agents I've acquired,
So that other Consumers can make informed decisions.

**Acceptance Criteria:**

**Given** I have acquired an agent
**When** I've used it for significant tasks
**Then** I can submit a rating and review (FR31)

**And** given I submit feedback
**When** I rate 1-5 stars
**Then** rating is recorded and visible on agent profile

**And** given I have concerns
**When** I submit complaint
**Then** it triggers Trust Score review process (FR52)

**And** given Trainer views feedback
**When** they see my review
**Then** they can respond publicly (FR22)

**Prerequisites:** Story 6.4

**Technical Notes:**
- Feedback requires minimum usage threshold
- One review per Consumer per agent
- Reviews can be updated
- Complaints flag agent for Council review
- Response appears threaded below review

---

### Story 6.6: Earnings Dashboard & Payouts

As a **Trainer**,
I want to view my earnings and receive payouts,
So that I'm compensated for my agents' work.

**Acceptance Criteria:**

**Given** I am a Trainer
**When** I visit /earnings
**Then** I see earnings dashboard (FR16)

**And** given my agents are used
**When** I view dashboard
**Then** I see real-time earnings tracking (FR112)

**And** given earnings exceed threshold
**When** payout period arrives
**Then** payout is processed (FR113)

**And** given I configure payout
**When** I set preferences
**Then** I can choose: bank transfer or crypto, weekly or threshold (FR114)

**And** given I want history
**When** I click "History"
**Then** I see all earnings and payouts with reports (FR115)

**Prerequisites:** Story 6.4

**Technical Notes:**
- Earnings calculated: (task_value × complexity) × (1 - platform_fee)
- Dashboard shows: today, this week, this month, all time
- Payout threshold: $100 minimum
- Stripe Connect for bank payouts
- Earnings history exportable

---

## Epic 7: Dashboard & Notifications

**Goal:** Provide unified management interface and proactive notifications.

**User Value:** Users can manage everything from one place and stay informed of important events.

**FRs Covered:** FR129-FR143

---

### Story 7.1: Role-Based Dashboard

As a **user**,
I want a dashboard tailored to my role,
So that I see relevant information immediately.

**Acceptance Criteria:**

**Given** I am logged in
**When** I visit /dashboard
**Then** I see role toggle if I have both roles (FR129)

**And** given I am viewing as Trainer
**When** dashboard loads
**Then** I see: my agents, earnings summary, training progress (FR130)

**And** given I am viewing as Consumer
**When** dashboard loads
**Then** I see: acquired agents, usage summary, costs (FR131)

**And** given I toggle roles
**When** view switches
**Then** dashboard updates without page reload

**Prerequisites:** Epic 1 complete

**Technical Notes:**
- Dashboard uses card-based layout
- Quick stats at top
- Recent activity feed
- Role preference persisted
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

---

### Story 7.2: Dashboard Tabs

As a **user**,
I want dedicated tabs for each platform feature,
So that I can navigate to detailed views easily.

**Acceptance Criteria:**

**Given** I am on dashboard
**When** I view tabs
**Then** I see: Academy, Council, Observer, Marketplace, Truth Chain (FR132-FR136)

**And** given I click Academy tab
**When** tab loads
**Then** I see enrolled agents, progress, graduates (FR132)

**And** given I click Council tab
**When** tab loads
**Then** I see recent decisions, pending votes, precedents (FR133)

**And** given I click Observer tab
**When** tab loads
**Then** I see event feed, anomalies (FR134)

**And** given I click Marketplace tab
**When** tab loads
**Then** I see listings (Trainer) or browse (Consumer) (FR135)

**And** given I click Truth Chain tab
**When** tab loads
**Then** I see recent records, verification tool (FR136)

**Prerequisites:** Story 7.1

**Technical Notes:**
- Tabs use URL routing: /dashboard/academy, etc.
- Each tab has sub-navigation
- Tab content lazy-loaded
- Breadcrumbs show current location
- Back button works correctly

---

### Story 7.3: Escalation Notifications

As a **human operator**,
I want immediate notifications for escalations,
So that I can respond to urgent decisions.

**Acceptance Criteria:**

**Given** a Level 4 action or deadlock escalates
**When** escalation triggers
**Then** I receive high-priority notification (FR137)

**And** given notification arrives
**When** I view it
**Then** I see: agent, action, risk level, Council votes, urgency

**And** given I am configured for email
**When** escalation occurs
**Then** email arrives within 30 seconds

**And** given I am in app
**When** escalation occurs
**Then** toast notification appears with sound

**Prerequisites:** Epic 3 complete

**Technical Notes:**
- Escalation notifications are highest priority
- Channels: email, in-app, webhook (FR143)
- Email uses SendGrid or similar
- In-app uses real-time subscriptions
- Notification includes direct link to escalation

---

### Story 7.4: Event Notifications

As a **user**,
I want notifications for important events,
So that I stay informed without constant checking.

**Acceptance Criteria:**

**Given** my agent graduates
**When** graduation completes
**Then** I receive celebration notification (FR138)

**And** given Observer detects anomaly
**When** anomaly is flagged
**Then** I receive anomaly alert (FR139)

**And** given ownership of agent I use changes
**When** change is announced
**Then** I receive ownership change notification (FR140)

**And** given my earnings hit milestone
**When** threshold crossed
**Then** I receive milestone notification (FR141)

**Prerequisites:** Story 7.3

**Technical Notes:**
- Notification types: graduation, anomaly, ownership, milestone, council_decision
- Each type has configurable urgency
- Milestones: first earning, $100, $1000, etc.
- Ownership notifications include opt-out link

---

### Story 7.5: Notification Preferences

As a **user**,
I want to configure my notification preferences,
So that I receive only what matters to me.

**Acceptance Criteria:**

**Given** I am in /settings/notifications
**When** page loads
**Then** I see list of all notification types (FR142)

**And** given a notification type
**When** I configure it
**Then** I can enable/disable channels: email, in-app, webhook (FR143)

**And** given I disable a type
**When** event occurs
**Then** I don't receive that notification

**And** given I configure webhook
**When** I enter URL
**Then** notifications POST to my endpoint

**Prerequisites:** Story 7.4

**Technical Notes:**
- Preferences stored in user_notification_preferences table
- Webhook includes retry logic (3 attempts)
- Email has unsubscribe link
- Escalations cannot be fully disabled (minimum: in-app)
- Test notification button for each channel

---

## Epic 8: API & Integration

**Goal:** Provide comprehensive API for external integrations.

**User Value:** External systems can integrate with AgentAnchor for verification and automation.

**FRs Covered:** FR144-FR149

---

### Story 8.1: RESTful API

As a **developer**,
I want a RESTful API,
So that I can integrate AgentAnchor with my systems.

**Acceptance Criteria:**

**Given** I have an API key
**When** I call any endpoint
**Then** I receive structured JSON response (FR144)

**And** given I call GET /api/agents
**When** I provide valid auth
**Then** I receive list of my agents

**And** given I call POST /api/council/request
**When** I provide valid payload
**Then** Upchain request is submitted

**And** given any API call
**When** I check headers
**Then** I see rate limit info (FR148)

**Prerequisites:** All previous epics provide functionality

**Technical Notes:**
- All endpoints under /api/v1/
- Consistent error format: {error: string, code: string, details?: object}
- Pagination via cursor or offset
- Rate limits per tier: Free (100/hr), Pro (1000/hr), Enterprise (10000/hr)
- CORS configured for allowed origins

---

### Story 8.2: API Authentication

As a **developer**,
I want secure API authentication,
So that my integrations are protected.

**Acceptance Criteria:**

**Given** I am in /settings/api-keys
**When** I click "Create Key"
**Then** I receive new API key (FR145)

**And** given I create a key
**When** I configure it
**Then** I can set scope: read-only, read-write, admin

**And** given I use a key
**When** I call API with header `Authorization: Bearer <key>`
**Then** request is authenticated

**And** given I suspect compromise
**When** I click "Revoke"
**Then** key is immediately invalidated

**Prerequisites:** Story 8.1

**Technical Notes:**
- API keys stored hashed (bcrypt)
- Key format: aa_live_xxx or aa_test_xxx
- Scopes limit available endpoints
- Key shows last used timestamp
- Maximum 10 keys per user

---

### Story 8.3: Webhooks

As a **developer**,
I want webhook notifications,
So that my system reacts to AgentAnchor events.

**Acceptance Criteria:**

**Given** I am in /settings/webhooks
**When** I click "Add Webhook"
**Then** I can configure endpoint URL and events (FR146)

**And** given I select events
**When** I choose from list
**Then** I can subscribe to: agent.graduated, council.decision, acquisition.created, etc.

**And** given subscribed event occurs
**When** webhook fires
**Then** my endpoint receives POST with event payload

**And** given my endpoint fails
**When** webhook retry triggers
**Then** 3 retries with exponential backoff occur

**Prerequisites:** Story 8.2

**Technical Notes:**
- Webhook payload includes signature for verification
- Signature: HMAC-SHA256 of payload with webhook secret
- Events include timestamp, type, data
- Webhook logs show delivery status
- Test webhook button for debugging

---

### Story 8.4: OpenAPI Documentation

As a **developer**,
I want complete API documentation,
So that I can integrate quickly and correctly.

**Acceptance Criteria:**

**Given** I visit /api/docs
**When** page loads
**Then** I see interactive OpenAPI documentation (FR149)

**And** given I view an endpoint
**When** I expand details
**Then** I see: parameters, request body, responses, examples

**And** given I want to test
**When** I use "Try it" feature
**Then** I can make live API calls from docs

**And** given I need OpenAPI spec
**When** I download openapi.json
**Then** I receive valid OpenAPI 3.0 specification

**Prerequisites:** Story 8.3

**Technical Notes:**
- Swagger UI for documentation
- OpenAPI spec auto-generated from route handlers
- Examples for all endpoints
- Authentication section explains API key usage
- Changelog section for API versioning

---

## FR Coverage Matrix

| FR | Description | Epic | Story |
|----|-------------|------|-------|
| FR1 | User registration | 1 | 1.3 |
| FR2 | MFA authentication | 1 | 1.3 |
| FR3 | Password reset | 1 | 1.3 |
| FR4 | Profile management | 1 | 1.4 |
| FR5 | Role selection | 1 | 1.4 |
| FR6 | Trainer storefront | 1 | 1.4 |
| FR7 | Consumer portfolio | 1 | 1.4 |
| FR8 | Subscription tier | 1 | 1.4 |
| FR9 | Create agents | 2 | 2.1 |
| FR10 | Agent capabilities | 2 | 2.1 |
| FR11 | Academy enrollment | 2 | 2.2 |
| FR12 | Publish to marketplace | 6 | 6.1 |
| FR13 | Set commission rates | 6 | 6.1 |
| FR14-FR22 | Advanced trainer features | — | Growth |
| FR23 | Browse marketplace | 6 | 6.2 |
| FR24 | Search/filter | 6 | 6.2 |
| FR25 | Agent profiles | 6 | 6.3 |
| FR26 | Observer reports | 6 | 6.3 |
| FR27 | Acquire (commission) | 6 | 6.4 |
| FR28-FR29 | Clone/Enterprise | — | Growth |
| FR30 | Usage tracking | 6 | 6.4 |
| FR31 | Consumer feedback | 6 | 6.5 |
| FR32-FR34 | Client protection | — | Growth |
| FR35 | Initial Trust Score 0 | 2 | 2.1 |
| FR36 | Academy required | 2 | 2.1 |
| FR37 | Graduation Trust Score | 2 | 2.5 |
| FR38 | Agent history | 2 | 2.6 |
| FR39 | Agent archive | 2 | 2.6 |
| FR40 | No deletion | 2 | 2.6 |
| FR41 | Core curriculum | 2 | 2.2 |
| FR42 | Training modules | 2 | 2.3 |
| FR43 | Progress tracking | 2 | 2.3 |
| FR44 | Trainer observation | 2 | 2.3 |
| FR45 | Council examination | 2 | 2.4 |
| FR46 | Graduation score | 2 | 2.5 |
| FR47-FR48 | Specialization/Mentorship | — | Growth |
| FR49 | Graduation on Truth Chain | 2 | 2.5 |
| FR50-FR57 | Trust Score system | 4 | 4.1-4.4 |
| FR58-FR67 | Council governance | 3 | 3.1-3.4 |
| FR68-FR75 | Upchain protocol | 3 | 3.3 |
| FR76-FR81 | Human-in-the-loop | 3 | 3.5 |
| FR82-FR91 | Observer layer | 5 | 5.1-5.3 |
| FR92-FR100 | Truth Chain | 5 | 5.4-5.5 |
| FR101-FR108 | Marketplace | 6 | 6.1-6.3 |
| FR109-FR115 | Commission/payments | 6 | 6.6 |
| FR116-FR128 | MIA/Client protection | — | Growth |
| FR129-FR136 | Dashboard | 7 | 7.1-7.2 |
| FR137-FR143 | Notifications | 7 | 7.3-7.5 |
| FR144-FR149 | API | 8 | 8.1-8.4 |

---

## Summary

### Epic Breakdown Complete

**AgentAnchor MVP Epic Structure:**
- **8 Epics** delivering incremental user value
- **40 Stories** sized for single dev agent sessions
- **149 FRs** mapped (95 in MVP, 54 deferred to Growth)

### Context Incorporated

- ✅ PRD requirements (149 FRs)
- ✅ UX interaction patterns
- ✅ Architecture technical decisions

### MVP Coverage

| Category | FRs | MVP Stories | Growth Deferred |
|----------|-----|-------------|-----------------|
| User Account | 8 | 8 | 0 |
| Trainer | 14 | 5 | 9 |
| Consumer | 12 | 7 | 5 |
| Agent Lifecycle | 6 | 6 | 0 |
| Academy | 9 | 7 | 2 |
| Trust Score | 8 | 8 | 0 |
| Council | 10 | 10 | 0 |
| Upchain | 8 | 8 | 0 |
| HITL | 6 | 6 | 0 |
| Observer | 10 | 10 | 0 |
| Truth Chain | 9 | 9 | 0 |
| Marketplace | 8 | 8 | 0 |
| Commission | 7 | 7 | 0 |
| MIA/Maintenance | 7 | 0 | 7 |
| Client Protection | 6 | 0 | 6 |
| Dashboard | 8 | 8 | 0 |
| Notifications | 7 | 7 | 0 |
| API | 6 | 6 | 0 |
| **Total** | **149** | **95** | **54** |

### Next Steps

1. Run `sprint-planning` workflow to generate sprint status
2. Begin Phase 4 Implementation with Epic 1
3. Use `create-story` workflow for detailed story implementation plans

---

_This document will be updated as implementation progresses and new context emerges._

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_"Agents you can anchor to."_
