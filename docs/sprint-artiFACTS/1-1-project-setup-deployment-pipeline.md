# Story 1.1: Project Setup & Deployment Pipeline

Status: ready-for-dev

## Story

As a **developer**,
I want the project scaffolded with a CI/CD pipeline,
so that code changes automatically deploy to staging/production environments.

## Acceptance Criteria

1. **AC1:** Fresh clone builds successfully
   - Given a fresh clone of the repository
   - When I run `npm install && npm run build`
   - Then the build completes without errors

2. **AC2:** Local development works
   - Given a fresh clone with dependencies installed
   - When I run `npm run dev`
   - Then the application starts on port 3000

3. **AC3:** GitHub Actions CI pipeline
   - Given a push to any branch
   - When GitHub Actions workflow triggers
   - Then lint, type-check, and tests run successfully

4. **AC4:** Preview deployments work
   - Given a push to a feature branch
   - When Vercel deployment completes
   - Then a preview URL is available and functional

5. **AC5:** Production deployment works
   - Given a merge to `main` branch
   - When Vercel production deployment completes
   - Then the app is live at the production domain

6. **AC6:** Environment variables configured
   - Given the deployment environments
   - When the app loads
   - Then all required environment variables are accessible

7. **AC7:** Error tracking operational
   - Given an error occurs in production
   - When Sentry captures it
   - Then the error appears in Sentry dashboard with context

## Tasks / Subtasks

- [ ] **Task 1: Verify and update project structure** (AC: 1, 2)
  - [ ] 1.1 Audit existing Next.js 14 setup in codebase
  - [ ] 1.2 Ensure App Router structure is correct (`app/` directory)
  - [ ] 1.3 Verify TypeScript strict mode is enabled in `tsconfig.json`
  - [ ] 1.4 Confirm Tailwind CSS + PostCSS configuration
  - [ ] 1.5 Verify shadcn/ui is properly configured

- [ ] **Task 2: Configure environment variables** (AC: 6)
  - [ ] 2.1 Create/update `.env.example` with all required variables
  - [ ] 2.2 Document required Supabase variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] 2.3 Document Upstash variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - [ ] 2.4 Document Sentry variables: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
  - [ ] 2.5 Create `lib/config.ts` for type-safe env access with validation

- [ ] **Task 3: Set up GitHub Actions CI** (AC: 3)
  - [ ] 3.1 Create `.github/workflows/ci.yml` workflow
  - [ ] 3.2 Add lint step (`npm run lint`)
  - [ ] 3.3 Add type-check step (`npx tsc --noEmit`)
  - [ ] 3.4 Add test step (`npm test`)
  - [ ] 3.5 Add build step (`npm run build`)
  - [ ] 3.6 Configure caching for `node_modules`

- [ ] **Task 4: Configure Vercel deployment** (AC: 4, 5)
  - [ ] 4.1 Verify Vercel project is connected to repository
  - [ ] 4.2 Configure preview deployments for PRs
  - [ ] 4.3 Configure production deployment on `main` branch
  - [ ] 4.4 Set environment variables in Vercel dashboard
  - [ ] 4.5 Verify build settings (Next.js framework preset)

- [ ] **Task 5: Configure Sentry error tracking** (AC: 7)
  - [ ] 5.1 Verify `@sentry/nextjs` is installed
  - [ ] 5.2 Update `sentry.client.config.ts` with proper DSN
  - [ ] 5.3 Update `sentry.server.config.ts` with proper DSN
  - [ ] 5.4 Update `sentry.edge.config.ts` with proper DSN
  - [ ] 5.5 Configure source maps upload in CI
  - [ ] 5.6 Test error capture with intentional error

- [ ] **Task 6: Create basic health check endpoint** (AC: 1, 4, 5)
  - [ ] 6.1 Create `app/api/health/route.ts` returning status + version
  - [ ] 6.2 Add response: `{ status: 'ok', version: process.env.npm_package_version, timestamp: Date.now() }`
  - [ ] 6.3 Use for deployment verification

- [ ] **Task 7: Validate complete setup** (AC: All)
  - [ ] 7.1 Run full local build and verify
  - [ ] 7.2 Push to feature branch, verify preview deployment
  - [ ] 7.3 Merge to main, verify production deployment
  - [ ] 7.4 Trigger intentional error, verify Sentry capture
  - [ ] 7.5 Document any deviations or issues

## Dev Notes

### Architecture Alignment

This story establishes the foundational infrastructure per Architecture document sections:
- **Section 2.1:** Next.js 14 with App Router, TypeScript 5.x strict mode
- **Section 2.2:** Supabase integration (configured in subsequent stories)
- **Section 2.3:** Vercel Edge deployment

**Tech Stack Confirmation:**
- Framework: Next.js 14.1.0 (already in package.json)
- UI: React 18.2.0 + Tailwind 3.4.1 + shadcn/ui
- Testing: Vitest (already configured)
- Error Tracking: Sentry (already in dependencies)

### Project Structure Notes

**Existing Structure (from codebase scan):**
```
app/
├── api/           # API routes (existing)
├── bots/          # Bot management pages
├── chat/          # Chat interface
├── orchestrator/  # Orchestrator pages
├── templates/     # Template pages
├── layout.tsx     # Root layout
└── page.tsx       # Home page

components/
├── ui/            # shadcn/ui components
└── bot-trust/     # Bot trust components

lib/
├── supabase/      # Supabase clients (to verify)
├── config.ts      # Configuration (to create/update)
└── ...

.github/
└── workflows/     # CI/CD workflows (to create/update)
```

**Files to Create/Modify:**
- `.github/workflows/ci.yml` - NEW
- `lib/config.ts` - UPDATE (add env validation)
- `app/api/health/route.ts` - NEW
- `.env.example` - UPDATE
- `sentry.*.config.ts` - UPDATE (verify DSN)

### Testing Requirements

Per tech spec test strategy:
- Unit tests not required for this story (infrastructure)
- Smoke test: Health endpoint returns 200
- E2E test: Can be deferred (CI pipeline validates build)

### References

- [Source: docs/sprint-artiFACTS/tech-spec-epic-1.md#Services-and-Modules]
- [Source: docs/sprint-artiFACTS/tech-spec-epic-1.md#Dependencies-and-Integrations]
- [Source: docs/architecture.md#Section-2.1-Tech-Stack]
- [Source: docs/epics.md#Story-1.1]

## Dev Agent Record

### Context Reference

- `docs/sprint-artiFACTS/1-1-project-setup-deployment-pipeline.context.xml`

### Agent Model Used

<!-- To be filled by dev agent -->

### Debug Log References

<!-- To be filled during implementation -->

### Completion Notes List

<!-- To be filled after implementation -->

### File List

<!-- To be filled after implementation -->
| Action | File Path | Notes |
|--------|-----------|-------|
| | | |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-11-28 | Bob (SM Agent) | Initial draft created |
