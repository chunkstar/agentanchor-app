# Story 1.4: User Profile & Role Selection

Status: drafted

## Story

As a **user**,
I want to set up my profile and choose my role,
so that I can use the platform as Trainer, Consumer, or Both.

## Acceptance Criteria

1. **AC1:** Role selection required for new users
   - Given I am a newly verified user
   - When I complete onboarding
   - Then I must select role: Trainer, Consumer, or Both (FR5)

2. **AC2:** Profile page displays current data
   - Given I am logged in
   - When I visit /settings/profile
   - Then I see my current profile data (name, avatar, email)

3. **AC3:** Profile updates save successfully
   - Given I am on the profile page
   - When I edit name, avatar, or notification preferences
   - Then changes save and persist (FR4)

4. **AC4:** Trainers see storefront settings
   - Given I selected "Trainer" or "Both" role
   - When I view my profile
   - Then I see storefront settings section (storefront_name, storefront_bio) (FR6)

5. **AC5:** Consumers see portfolio section
   - Given I selected "Consumer" or "Both" role
   - When I view my profile
   - Then I see agent portfolio and usage section (FR7)

6. **AC6:** Role can be changed
   - Given I am on settings page
   - When I change my role
   - Then the change takes effect immediately and UI updates

7. **AC7:** Notification preferences work
   - Given I am on profile settings
   - When I toggle notification preferences (email, in_app, webhook)
   - Then preferences persist and are respected by notification system

## Tasks / Subtasks

- [ ] **Task 1: Create onboarding flow** (AC: 1)
  - [ ] 1.1 Create `app/(onboarding)/layout.tsx` - onboarding layout
  - [ ] 1.2 Create `app/(onboarding)/role-selection/page.tsx`
  - [ ] 1.3 Build role selection UI with 3 cards: Trainer, Consumer, Both
  - [ ] 1.4 Add role descriptions and icons for each option
  - [ ] 1.5 Save role to profiles table via API
  - [ ] 1.6 Redirect to dashboard after selection
  - [ ] 1.7 Middleware: redirect new users without role to onboarding

- [ ] **Task 2: Create profile settings page** (AC: 2, 3)
  - [ ] 2.1 Create `app/(dashboard)/settings/page.tsx`
  - [ ] 2.2 Create `app/(dashboard)/settings/profile/page.tsx`
  - [ ] 2.3 Build profile form: name, avatar upload, email (readonly)
  - [ ] 2.4 Implement avatar upload (Supabase Storage or similar)
  - [ ] 2.5 Create `app/api/profile/route.ts` - GET/PATCH profile
  - [ ] 2.6 Add form validation with Zod
  - [ ] 2.7 Show success/error toasts on save

- [ ] **Task 3: Implement role-based sections** (AC: 4, 5, 6)
  - [ ] 3.1 Create `components/profile/TrainerStorefront.tsx`
  - [ ] 3.2 Create `components/profile/ConsumerPortfolio.tsx`
  - [ ] 3.3 Conditionally render sections based on user role
  - [ ] 3.4 Add role change dropdown/selector in settings
  - [ ] 3.5 Create API endpoint for role change
  - [ ] 3.6 Update middleware to handle role changes

- [ ] **Task 4: Implement notification preferences** (AC: 7)
  - [ ] 4.1 Create `app/(dashboard)/settings/notifications/page.tsx`
  - [ ] 4.2 Build notification toggles: email, in_app, webhook
  - [ ] 4.3 Add webhook URL input (conditional on webhook enabled)
  - [ ] 4.4 Save preferences to profiles.notification_preferences JSONB
  - [ ] 4.5 Create `app/api/profile/notifications/route.ts`

- [ ] **Task 5: Create shared profile components** (AC: All)
  - [ ] 5.1 Create `components/profile/ProfileHeader.tsx` - avatar + name
  - [ ] 5.2 Create `components/profile/RoleBadge.tsx` - role indicator
  - [ ] 5.3 Create `components/settings/SettingsSidebar.tsx` - settings nav
  - [ ] 5.4 Style components per UX design specification

- [ ] **Task 6: Validate complete flow** (AC: All)
  - [ ] 6.1 Test new user onboarding → role selection → dashboard
  - [ ] 6.2 Test profile editing and persistence
  - [ ] 6.3 Test role change flow
  - [ ] 6.4 Test notification preferences
  - [ ] 6.5 Verify role-based UI sections

## Dev Notes

### Architecture Alignment

This story implements user profile management per:
- **PRD FR4:** Profile and notifications management
- **PRD FR5:** Role selection (Trainer/Consumer/Both)
- **PRD FR6:** Trainer storefront profile
- **PRD FR7:** Consumer agent portfolio
- **Tech Spec:** Profile API routes, profiles table schema

### Learnings from Previous Stories

**From Story 1.1 (done):**
- Use `lib/config.ts` pattern for environment validation
- Run `npm run build` after changes

**From Story 1.2 (ready-for-dev):**
- Database is Neon + Drizzle (not Supabase DB)
- Profiles table schema defined in Drizzle schema

**From Story 1.3 (drafted):**
- Auth provider decision impacts profile sync
- If Supabase Auth: profile created on email verification
- If NextAuth: profile created via Drizzle adapter

### Database Schema Reference

```typescript
// From lib/db/schema/users.ts (Story 1.2)
profiles: {
  id: uuid primaryKey references auth.users,
  email: text notNull,
  full_name: text,
  avatar_url: text,
  role: enum('trainer', 'consumer', 'both') default 'consumer',
  subscription_tier: enum('free', 'pro', 'enterprise') default 'free',
  notification_preferences: jsonb default {email: true, in_app: true, webhook: false},
  storefront_name: text, // Trainers only
  storefront_bio: text,  // Trainers only
  created_at: timestamp,
  updated_at: timestamp
}
```

### Project Structure Notes

**Files to Create:**
```
app/(onboarding)/
├── layout.tsx
└── role-selection/page.tsx

app/(dashboard)/settings/
├── page.tsx
├── profile/page.tsx
└── notifications/page.tsx

components/profile/
├── ProfileHeader.tsx
├── RoleBadge.tsx
├── TrainerStorefront.tsx
└── ConsumerPortfolio.tsx

components/settings/
└── SettingsSidebar.tsx

app/api/profile/
├── route.ts
└── notifications/route.ts
```

### Testing Requirements

- E2E: New user onboarding flow
- E2E: Profile update flow
- Integration: Profile API CRUD operations
- Unit: Role-based component rendering

### References

- [Source: docs/epics.md#Story-1.4]
- [Source: docs/sprint-artiFACTS/tech-spec-epic-1.md#Data-Models]
- [Source: docs/prd.md#FR4-FR7]
- [Source: docs/ux-design-spec.md#Onboarding]

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
