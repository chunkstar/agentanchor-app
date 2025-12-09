# AgentAnchor Sprint Plan

**Project:** AgentAnchor - AI Governance Operating System
**Created:** 2025-12-03
**Updated:** 2025-12-07
**Phase:** Growth Phase - Council Priority Implementation

---

## Phase Summary

| Phase | Epics | Stories | Status |
|-------|-------|---------|--------|
| **MVP** | Epic 1-8 | 41/41 | ✅ COMPLETE |
| **Growth** | Epic 9-16 | 6/38 | 🔄 In Progress |

---

## MVP PHASE COMPLETE ✅

### All 8 Epics Delivered (41 Stories)

| Epic | Title | Stories | Status |
|------|-------|---------|--------|
| 1 | Foundation & Infrastructure | 5/5 | ✅ Complete |
| 2 | Agent Creation & Academy | 6/6 | ✅ Complete |
| 3 | Council of Nine Governance | 5/5 | ✅ Complete |
| 4 | Trust Score System | 4/4 | ✅ Complete |
| 5 | Observer & Truth Chain | 5/5 | ✅ Complete |
| 6 | Unified Marketplace | 7/7 | ✅ Complete |
| 7 | Dashboard & Notifications | 5/5 | ✅ Complete |
| 8 | API & Integration | 4/4 | ✅ Complete |

```
MVP Progress: ████████████████████ 100%
```

---

## GROWTH PHASE - Council Priority Sprint 🚀

### Council Vote Results (2025-12-07)

The 16-advisor council voted on implementation priorities:

| Rank | Feature | Score | Epic | Status |
|------|---------|-------|------|--------|
| 1 | Risk×Trust Matrix | 80 | Epic 3 | ✅ DONE |
| 2 | HITL Overlay | 42 | Epic 3 | ✅ DONE |
| 3 | **Circuit Breaker** | 39 | **Epic 16** | 🆕 NEW |
| 4 | Trust Scoring | 36 | Epic 4 | ✅ DONE |
| 5 | Observer Layer | 33 | Epic 5 | ✅ DONE |
| 6 | Reporting | 22 | Epic 7 | ✅ DONE |

**Key Insight:** Top MVP priorities already built! Growth focus on #3 Circuit Breaker.

---

### Current Sprint Focus

#### 1. Epic 16: Circuit Breaker & Kill Switch 🆕

**Priority:** Council #3 (39 points)
**Rationale:** Jocko - "Safety is #1. Know where the off switch is before you start."

| Story | Title | Status |
|-------|-------|--------|
| 16-1 | Agent Pause/Resume | Backlog |
| 16-2 | Global Kill Switch | Backlog |
| 16-3 | Cascade Halt Protocol | Backlog |
| 16-4 | Kill Switch Truth Chain | Backlog |

**Deliverables:**
- Per-agent pause/resume with reason tracking
- Platform-wide emergency stop (admin only)
- Automatic halt of dependent agents
- All halts recorded immutably on Truth Chain

---

#### 2. Epic 15: Portable Trust Credentials 🔄

**Priority:** MOAT BUILDER - Network Effect
**Status:** 3/5 stories complete

| Story | Title | Status |
|-------|-------|--------|
| 15-1 | Credential Issuance | ✅ Done |
| 15-2 | Credential Signing (ES256) | ✅ Done |
| 15-3 | Verification API | ✅ Done |
| 15-4 | Credential Refresh | 🔄 In Progress |
| 15-5 | Revocation System | Backlog |

**Remaining Work:**
- Auto-refresh credentials before expiry
- Revocation list with instant invalidation
- External platform verification flow

---

#### 3. Epic 14: Precedent Flywheel 📊

**Priority:** MOAT BUILDER - Data Network Effect
**Status:** Backlog

| Story | Title | Status |
|-------|-------|--------|
| 14-1 | Decision Indexing | Backlog |
| 14-2 | Precedent Similarity Search | Backlog |
| 14-3 | Validator Precedent Context | Backlog |
| 14-4 | Consistency Tracking | Backlog |
| 14-5 | Validator Fine-Tuning Pipeline | Backlog |

**Why This Matters:**
- Every Council decision improves future decisions
- Data asset grows with usage (defensible moat)
- AI governance that learns (unique capability)

---

## Growth Phase Epic Overview

| Epic | Title | Stories | Priority | Status |
|------|-------|---------|----------|--------|
| **16** | **Circuit Breaker** | 4 | Council #3 | 🆕 Backlog |
| **15** | **Portable Trust Credentials** | 5 | Moat Builder | 🔄 60% |
| **14** | **Precedent Flywheel** | 5 | Moat Builder | Backlog |
| 13 | Academy Specializations | 4 | Depth | Backlog |
| 12 | Maintenance Delegation | 4 | Trainer UX | Backlog |
| 11 | Client Bill of Rights | 5 | Trust | Backlog |
| 10 | MIA Protocol | 5 | Trust | Backlog |
| 9 | Clone & Enterprise | 5 | Revenue | Backlog |

**Growth Total:** 37 stories (6 done/in-progress, 31 backlog)

```
Growth Progress: ██░░░░░░░░░░░░░░░░░░ 16%
```

---

## Sprint Execution Order

Based on Council vote and strategic priorities:

### Sprint 9 (Current): Safety & Credentials
- [ ] Epic 16: Circuit Breaker (4 stories)
- [ ] Epic 15: Complete credentials (2 stories)

### Sprint 10: Governance Moat
- [ ] Epic 14: Precedent Flywheel (5 stories)

### Sprint 11: Consumer Protection
- [ ] Epic 11: Client Bill of Rights (5 stories)
- [ ] Epic 10: MIA Protocol (5 stories)

### Sprint 12: Advanced Features
- [ ] Epic 13: Academy Specializations (4 stories)
- [ ] Epic 12: Maintenance Delegation (4 stories)

### Sprint 13: Revenue Expansion
- [ ] Epic 9: Clone & Enterprise (5 stories)

---

## Progress Summary

| Metric | MVP | Growth | Total |
|--------|-----|--------|-------|
| Epics | 8 | 8 | 16 |
| Stories | 41 | 37 | 78 |
| Complete | 41 | 3 | 44 |
| In Progress | 0 | 1 | 1 |
| Backlog | 0 | 33 | 33 |

```
Overall:  ████████████░░░░░░░░ 58%
MVP:      ████████████████████ 100%
Growth:   ███░░░░░░░░░░░░░░░░░ 11%
```

---

## Definition of Done

A story is **done** when:
- [ ] All acceptance criteria met
- [ ] Code reviewed (code-review workflow)
- [ ] Tests passing (unit + integration)
- [ ] Build succeeds
- [ ] Deployed to production
- [ ] Story file updated with completion notes
- [ ] Truth Chain record created (for significant changes)

---

## Workflow Commands

```bash
# Check current status
/bmad:bmm:workflows:workflow-status

# Mark story ready for dev
/bmad:bmm:workflows:story-ready

# Execute story implementation
/bmad:bmm:workflows:dev-story

# Code review
/bmad:bmm:workflows:code-review

# Mark story done
/bmad:bmm:workflows:story-done

# Run retrospective after epic
/bmad:bmm:workflows:retrospective
```

---

*Last Updated: 2025-12-07*
*"Agents you can anchor to."*
