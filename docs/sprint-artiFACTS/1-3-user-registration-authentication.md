# Story 1.3: User Registration & Authentication

Status: drafted

## Story

As a **user**,
I want to create an account and log in securely,
so that I can access the platform.

## Acceptance Criteria

1. **AC1:** User can register with email/password
   - Given I am on the registration page
   - When I enter valid email and password (8+ chars, 1 uppercase, 1 number, 1 special)
   - Then my account is created and I receive a verification email

2. **AC2:** Email verification works
   - Given I click the verification link within 15 minutes
   - When the page loads
   - Then my email is verified and I can log in

3. **AC3:** User can log in
   - Given I am on the login page with valid credentials
   - When I submit the form
   - Then I am authenticated and redirected to dashboard

4. **AC4:** Password reset works
   - Given I am logged out and click "Forgot Password"
   - When I enter my email
   - Then I receive a password reset email (FR3)

5. **AC5:** Session management
   - Given I am logged in
   - When I close and reopen the browser
   - Then my session persists (within 24 hours)

6. **AC6:** Rate limiting enforced
   - Given I attempt to log in
   - When I fail 5 times in an hour
   - Then further attempts are blocked with appropriate message

7. **AC7:** Password strength validation
   - Given I am registering
   - When I type a password
   - Then I see real-time strength feedback

## Tasks / Subtasks

- [ ] **Task 1: Set up authentication provider** (AC: 1, 3, 5)
  - [ ] 1.1 Choose auth provider: Supabase Auth OR NextAuth.js
  - [ ] 1.2 If Supabase Auth: Configure Supabase Auth settings
  - [ ] 1.3 If NextAuth.js: Install next-auth, configure Drizzle adapter
  - [ ] 1.4 Create `lib/auth/` folder with auth utilities
  - [ ] 1.5 Update `middleware.ts` for route protection

- [ ] **Task 2: Create registration page** (AC: 1, 7)
  - [ ] 2.1 Create `app/(auth)/register/page.tsx`
  - [ ] 2.2 Build registration form with email, password, confirm password
  - [ ] 2.3 Implement password strength meter component
  - [ ] 2.4 Add form validation with Zod schema
  - [ ] 2.5 Handle registration submission
  - [ ] 2.6 Show success message with "check your email" prompt

- [ ] **Task 3: Create login page** (AC: 3)
  - [ ] 3.1 Create `app/(auth)/login/page.tsx`
  - [ ] 3.2 Build login form with email, password
  - [ ] 3.3 Add "Remember me" checkbox
  - [ ] 3.4 Add "Forgot password" link
  - [ ] 3.5 Handle login submission
  - [ ] 3.6 Redirect to dashboard on success

- [ ] **Task 4: Implement email verification** (AC: 2)
  - [ ] 4.1 Create `app/(auth)/verify-email/page.tsx`
  - [ ] 4.2 Handle verification token from URL
  - [ ] 4.3 Show success/error states
  - [ ] 4.4 Redirect to login after verification
  - [ ] 4.5 Handle expired tokens gracefully

- [ ] **Task 5: Implement password reset** (AC: 4)
  - [ ] 5.1 Create `app/(auth)/forgot-password/page.tsx`
  - [ ] 5.2 Create `app/(auth)/reset-password/page.tsx`
  - [ ] 5.3 Handle reset token from email
  - [ ] 5.4 Validate new password meets requirements
  - [ ] 5.5 Show success and redirect to login

- [ ] **Task 6: Implement rate limiting** (AC: 6)
  - [ ] 6.1 Use existing Upstash rate limiter from `lib/rate-limit.ts`
  - [ ] 6.2 Create login-specific rate limit: 5 attempts/hour/IP
  - [ ] 6.3 Add rate limit check to login endpoint
  - [ ] 6.4 Show appropriate error message when limited
  - [ ] 6.5 Add rate limit headers to response

- [ ] **Task 7: Create auth layout and shared components** (AC: All)
  - [ ] 7.1 Create `app/(auth)/layout.tsx` - centered card layout
  - [ ] 7.2 Create `components/auth/PasswordStrengthMeter.tsx`
  - [ ] 7.3 Create `components/auth/AuthCard.tsx` - reusable card wrapper
  - [ ] 7.4 Create `components/auth/SocialLogin.tsx` (placeholder for future)
  - [ ] 7.5 Style forms per UX design specification

- [ ] **Task 8: Validate complete auth flow** (AC: All)
  - [ ] 8.1 Test full registration → verify → login flow
  - [ ] 8.2 Test password reset flow
  - [ ] 8.3 Test rate limiting triggers correctly
  - [ ] 8.4 Test session persistence across browser refresh
  - [ ] 8.5 Verify protected routes redirect to login
  - [ ] 8.6 Document any deviations

## Dev Notes

### Architecture Alignment

This story implements user authentication per:
- **PRD FR1-FR3:** Registration, MFA (optional), password reset
- **Tech Spec:** Authentication endpoints and session management
- **UX Design:** Auth page layouts and password strength feedback

### Auth Provider Decision

**Option A: Supabase Auth (Recommended for MVP)**
- Pros: Already have Supabase, email templates built-in, MFA ready
- Cons: Dependency on Supabase service
- Integration: Use `@supabase/auth-helpers-nextjs`

**Option B: NextAuth.js**
- Pros: Full control, works with any DB
- Cons: More setup, need email service (Resend/SendGrid)
- Integration: Use Drizzle adapter with Neon

**Recommendation:** Start with Supabase Auth - minimal setup, battle-tested.

### Learnings from Previous Stories

**From Story 1.1:**
- `lib/config.ts` has Zod validation pattern - reuse for auth config
- `lib/rate-limit.ts` already exists with Upstash - reuse for login rate limiting
- Run `npm run build` after changes

**From Story 1.2:**
- Neon is the database (not Supabase DB)
- Drizzle ORM for type-safe queries
- Pusher for realtime (not needed for auth)

### Project Structure Notes

**Files to Create:**
```
app/(auth)/
├── layout.tsx           # Auth pages layout
├── login/page.tsx       # Login form
├── register/page.tsx    # Registration form
├── verify-email/page.tsx
├── forgot-password/page.tsx
└── reset-password/page.tsx

components/auth/
├── AuthCard.tsx
├── PasswordStrengthMeter.tsx
└── SocialLogin.tsx

lib/auth/
├── index.ts             # Auth utilities
├── session.ts           # Session helpers
└── validation.ts        # Password validation
```

**Files to Modify:**
- `middleware.ts` - Add auth route protection
- `lib/config.ts` - Add auth-related env vars

### Password Requirements

Per PRD security requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Testing Requirements

- E2E: Full registration → verification → login flow
- E2E: Password reset flow
- Integration: Rate limiting works
- Unit: Password validation logic

### References

- [Source: docs/sprint-artiFACTS/tech-spec-epic-1.md#Workflows-and-Sequencing]
- [Source: docs/sprint-artiFACTS/tech-spec-epic-1.md#Security]
- [Source: docs/prd.md#FR1-FR3]
- [Source: docs/epics.md#Story-1.3]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

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
