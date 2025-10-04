# Admin Pages Functionality Audit

## Date: October 4, 2025
## Purpose: Comprehensive check of all admin routes, APIs, and database queries

---

## Audit Status Legend
- ✅ **PASS**: Functionality verified, no issues
- ⚠️ **WARNING**: Potential issues, needs testing
- ❌ **FAIL**: Critical issues found, requires fixing
- 🔍 **NEEDS REVIEW**: Requires manual testing

---

## Category 1: User Management (7 pages)

### 1. User Management (`/admin/users`)
**Status**: 🔍 **NEEDS REVIEW**
**File**: `app/admin/users/UsersPage.tsx`

**Database Queries**:
```typescript
// Query structure
.from('users')
.select('*, user_roles(*), clubs(*)')
```

**Potential Issues**:
- ⚠️ Schema has both `users.club_id` AND `players.club_id` - may cause confusion
- ⚠️ User roles stored in separate `user_roles` table
- ⚠️ Need to verify join syntax matches schema

**API Endpoints Used**:
- `/api/admin/users-list` - Needs verification
- Export CSV functionality - Client-side only

**Recommendations**:
- Verify user-club relationship (direct via `users.club_id` or through `players` table)
- Check if `user_roles` join is correct

---

### 2. Complete User Deletion (`/admin/complete-user-deletion`)
**Status**: ⚠️ **WARNING**
**File**: `app/admin/complete-user-deletion/page.tsx`

**API Endpoints**:
- `/api/admin/delete-user-complete` - Deletes from both `auth.users` and `public.users`

**Potential Issues**:
- ⚠️ Cascading deletes may fail if foreign key constraints exist
- ⚠️ Schema shows many tables reference `auth.users.id`:
  - `players.user_id` → `users.id` (NOT auth.users!)
  - `user_roles.user_id` → `users.id`
  - `notifications.user_id` → `users.id`
  
**Critical Issue**:
- ❌ **MISMATCH**: Some tables reference `auth.users`, others reference `public.users`
- Need to ensure deletion handles both properly

---

### 3. Banned Users Management (`/admin/banned-users`)
**Status**: ⚠️ **WARNING**
**File**: `app/admin/banned-users/page.tsx`

**Database Tables**:
- `banned_users` table exists ✅
- `users.is_banned` column exists ✅
- `users.ban_reason` column exists ✅
- `users.ban_expiration` column exists ✅

**Potential Issues**:
- ⚠️ Dual ban system: `banned_users` table AND `users.is_banned` column
- Need to sync both when banning/unbanning

**API Endpoints**:
- `/api/admin/ban-user`
- `/api/admin/unban-user`

---

### 4. Season Registrations (`/admin/registrations`)
**Status**: ✅ **LIKELY PASS**
**File**: `app/admin/registrations/page.tsx`

**Database Table**: `season_registrations`
**Schema Columns**:
- `user_id` → `users.id` ✅
- `season_id` → `seasons.id` ✅
- `season_number` ✅
- `primary_position`, `secondary_position` ✅
- `gamer_tag`, `console` ✅
- `status` (Pending, Approved, Rejected) ✅

**Looks Good**: Schema matches expected usage

---

### 5. User Diagnostics (`/admin/user-diagnostics`)
**Status**: 🔍 **NEEDS REVIEW**

**Potential Queries**:
- User session data
- Login history from `ip_logs` table
- User roles from `user_roles` table

---

### 6. User Account Manager (`/admin/user-account-manager`)
**Status**: 🔍 **NEEDS REVIEW**

**Potential Issues**:
- May query multiple user-related tables
- Need to verify all relationships

---

### 7. Orphaned Auth Users (`/admin/orphaned-auth-users`)
**Status**: ⚠️ **WARNING**

**Purpose**: Find users in `auth.users` but not in `public.users`

**Query Should Be**:
```typescript
// Get all auth users
const { data: authUsers } = await supabase.auth.admin.listUsers()

// Get all public users
const { data: publicUsers } = await supabase
  .from('users')
  .select('id')

// Find orphans
const orphans = authUsers.filter(au => 
  !publicUsers.find(pu => pu.id === au.id)
)
```

---

## Category 2: Team Operations (3 pages)

### 8. Team Management (`/admin/club-management`)
**Status**: ✅ **FIXED**
**File**: `app/admin/club-management/page.tsx`

**Database Table**: `clubs`
**Recent Fixes**:
- ✅ Added `bg="dark.7"` to Paper
- ✅ Added `bg="dark.8"` to Card

**Schema Columns Match**: ✅
- All expected columns exist in schema

---

### 9. Team Availability (`/admin/club-availability`)
**Status**: ✅ **LIKELY PASS**

**Database Table**: `game_availability`
**Schema**:
- `fixture_id` → `fixtures.id` ✅
- `player_id` → `players.id` ✅
- `user_id` → `auth.users.id` ✅
- `club_id` → `clubs.id` ✅
- `status` (available, unavailable, injury_reserve) ✅

---

### 10. Team Logos (`/admin/club-logos`)
**Status**: ✅ **LIKELY PASS**

**Database**: Updates `clubs.logo_url` column ✅

---

## Category 3: Game Management (1 page)

### 11. Schedule Management (`/admin/schedule`)
**Status**: ✅ **FIXED**

**Database Table**: `fixtures`
**Schema Columns**: ✅
- `home_club_id`, `away_club_id` → `clubs.id`
- `season_id` → `seasons.id`
- `match_date`, `status`, `home_score`, `away_score`
- `ea_match_id`, `ea_match_data`

---

## Category 4: System Tools (8 pages)

### 12. Update Current Season (`/admin/update-current-season`)
**Status**: ✅ **LIKELY PASS**

**Database**: Updates `seasons.is_active` column

---

### 13. System Settings (`/admin/settings`)
**Status**: ✅ **FIXED**
**File**: `app/admin/settings/AdminSettingsPageClient.tsx`

**Database Table**: `system_settings`
**Schema**:
- `key` (unique) ✅
- `value` (jsonb) ✅

**Recent Fixes**:
- ✅ Added dark background
- ✅ Fixed text colors

---

### 14. Auth to Database Sync (`/admin/sync-auth-database`)
**Status**: ⚠️ **WARNING**

**Purpose**: Sync `auth.users` with `public.users`

**Critical Issue**:
- ❌ **SCHEMA MISMATCH**: Many tables reference `auth.users.id` directly:
  - `admin_actions.admin_user_id` → `auth.users.id`
  - `banned_users.user_id` → `auth.users.id`
  - `ea_player_mappings.user_id` → `auth.users.id`
  - `player_signings.approved_by` → `auth.users.id`
  
- But other tables reference `public.users.id`:
  - `players.user_id` → `users.id`
  - `user_roles.user_id` → `users.id`
  - `notifications.user_id` → `users.id`

**Recommendation**:
- ⚠️ Need consistent foreign key strategy
- Should all reference `auth.users.id` OR all reference `public.users.id`

---

### 15. Sync Missing Users (`/admin/sync-missing-users`)
**Status**: ✅ **FIXED**

**Recent Fixes**:
- ✅ Added dark background

---

### 16. Fix User Constraints (`/admin/fix-user-constraints`)
**Status**: 🔍 **NEEDS REVIEW**

---

### 17. Fix Console Values (`/admin/fix-console-values`)
**Status**: ✅ **LIKELY PASS**

**Database**: Updates `users.console` column (Xbox, PS5)

---

### 18. Role Sync Fix (`/admin/role-sync`)
**Status**: ⚠️ **WARNING**

**Critical Issue**:
- ❌ **DUAL ROLE SYSTEM**:
  1. `user_roles` table with `role_id` → `roles.id`
  2. `players.role` column (Player, GM, AGM, Owner)
  
**Need to Sync**:
```typescript
// Get user roles from user_roles table
const { data: userRoles } = await supabase
  .from('user_roles')
  .select('*, roles(*)')
  .eq('user_id', userId)

// Get player role
const { data: player } = await supabase
  .from('players')
  .select('role')
  .eq('user_id', userId)
  .single()

// Sync logic needed
```

---

### 19. Database Structure (`/admin/database-structure`)
**Status**: ✅ **LIKELY PASS**

**Purpose**: Display schema information

---

## Category 5: Financial Tools (2 pages)

### 20. Transfer Recap (`/admin/transfer-recap`)
**Status**: ✅ **FIXED**
**File**: `app/admin/transfer-recap/page.tsx`

**Recent Fixes**:
- ✅ Changed table from `"transfers"` → `"player_transfers"`
- ✅ Fixed field names: `transfer_fee` → `transfer_amount`
- ✅ Fixed field names: `transfer_date` → `created_at`
- ✅ Changed `status` → `transfer_type`
- ✅ Fixed join syntax

**Database Table**: `player_transfers` ✅

---

### 21. Manage Tokens (`/admin/tokens`)
**Status**: ✅ **LIKELY PASS**

**Database Tables**:
- `tokens` ✅
- `token_transactions` ✅
- `token_redemptions` ✅
- `token_redeemables` ✅

**Schema Looks Good**: All expected columns exist

---

## Category 6: Content Management (6 pages)

### 22. Daily Recap (`/admin/daily-recap`)
**Status**: ✅ **LIKELY PASS**

**Database Table**: `daily_recaps`
**Schema**:
- `date` (unique) ✅
- `recap_data` (jsonb with team_recaps array) ✅

---

### 23. News Management (`/admin/news`)
**Status**: ✅ **LIKELY PASS**

**Database Table**: `news`
**Schema**: ✅
- `author_id` → `users.id`
- `title`, `content`, `excerpt`
- `published`, `featured`
- `image_url`

---

### 24. Awards Management (`/admin/awards`)
**Status**: ✅ **LIKELY PASS**

**Database Table**: `club_awards`
**Schema**: ✅
- `club_id` → `clubs.id`
- `award_type`, `season_number`, `year`

---

### 25. Photo Gallery (`/admin/photos`)
**Status**: ✅ **FIXED**

**Database Table**: `photos`
**Schema**: ✅
- `title`, `description`, `category`
- `file_path`, `url`

**Recent Fixes**:
- ✅ Updated text colors

---

### 26. Forum Management (`/admin/forum`)
**Status**: ⚠️ **WARNING**

**Database Tables**:
- `forum_categories` ✅
- `forum_posts` ✅
- `forum_comments` ✅

**Also Has** (Legacy?):
- `forum_threads`
- `forum_replies`
- `forums`
- `threads`
- `posts`

**Potential Issue**:
- ⚠️ Multiple forum systems in schema - which one is active?

---

### 27. Featured Games (`/admin/featured-games`)
**Status**: ✅ **LIKELY PASS**

**Database**: Updates `fixtures.featured` column ✅

---

## Category 7: Data & Statistics (4 pages)

### 28. Statistics Management (`/admin/statistics`)
**Status**: ✅ **FIXED**

**Database Tables**:
- `ea_player_stats` ✅
- `ea_club_stats` ✅
- `fixtures` ✅

---

### 29. EA Stats (`/admin/ea-stats`)
**Status**: ✅ **LIKELY PASS**

**Database Tables**:
- `ea_player_stats` ✅
- `ea_club_stats` ✅
- `ea_match_data` ✅

---

### 30. EA Matches (`/admin/ea-matches`)
**Status**: ✅ **LIKELY PASS**

**Database Table**: `ea_match_data`
**Schema**: ✅
- `fixture_id` (unique)
- `data` (jsonb)

---

### 31. Player Mappings (`/admin/player-mappings`)
**Status**: ✅ **LIKELY PASS**

**Database Table**: `ea_player_mappings`
**Schema**: ✅
- `ea_player_id` (unique)
- `user_id` → `auth.users.id`
- `player_name`

---

## Category 8: Security & Access (4 pages)

### 32. Email Verification (`/admin/email-verification`)
**Status**: ✅ **LIKELY PASS**

**Database Table**: `verification_tokens`
**Schema**: ✅
- `user_id` → `users.id`
- `token` (unique)
- `expires_at`, `used_at`

---

### 33. Password Reset (`/admin/password-reset`)
**Status**: 🔍 **NEEDS REVIEW**

**Uses**: Supabase Auth API

---

### 34. Reset User Password (`/admin/reset-user-password`)
**Status**: ✅ **FIXED**

**Recent Fixes**:
- ✅ Updated text colors

---

### 35. RBAC Debug (`/admin/rbac-debug`)
**Status**: ⚠️ **WARNING**

**Database Tables**:
- `roles` ✅
- `permissions` ✅
- `role_permissions` ✅
- `user_roles` ✅

**Potential Issue**:
- ⚠️ RBAC system exists but may not be fully implemented
- Check if permissions are actually enforced

---

## Category 9: Integrations (3 pages)

### 36. SCS Bot (`/admin/scs-bot`)
**Status**: ✅ **FIXED**

**Database Table**: `discord_bot_config`
**Schema**: ✅
- `guild_id`, `bot_token`
- `registered_role_id`

**Recent Fixes**:
- ✅ Added dark background
- ✅ Updated text colors

---

### 37. Setup Bot Config (`/admin/setup-bot-config`)
**Status**: ✅ **FIXED**

**Database Table**: `discord_bot_config` ✅

**Recent Fixes**:
- ✅ Added dark background

---

### 38. Discord Debug (`/admin/discord-debug`)
**Status**: ✅ **LIKELY PASS**

**Database Tables**:
- `discord_users` ✅
- `discord_club_roles` ✅
- `discord_bot_config` ✅

---

## Critical Issues Summary

### 🔴 **HIGH PRIORITY FIXES NEEDED**

#### 1. **Foreign Key Inconsistency**
**Issue**: Mixed references to `auth.users.id` vs `public.users.id`

**Tables Referencing `auth.users.id`**:
- `admin_actions.admin_user_id`
- `banned_users.user_id`
- `banned_users.banned_by`
- `ea_player_mappings.user_id`
- `player_signings.approved_by`
- `club_managers.user_id`
- `analytics_events.user_id`
- `code_downloads.user_id`
- `file_access_logs.user_id`
- `security_events.user_id`
- `posts.user_id`
- `threads.user_id`

**Tables Referencing `public.users.id`**:
- `players.user_id`
- `user_roles.user_id`
- `notifications.user_id`
- `news.author_id`
- `ip_logs.user_id`
- `discord_users.user_id`
- `season_registrations.user_id`
- `verification_tokens.user_id`
- `token_transactions.user_id`
- `token_redemptions.user_id`
- `tokens.user_id`
- `game_availability.user_id`
- `injury_reserves.user_id`

**Recommendation**:
- ⚠️ **CRITICAL**: Need to standardize on ONE approach
- Option A: All reference `auth.users.id`
- Option B: All reference `public.users.id` (with trigger to sync from auth)
- Current mixed approach will cause data integrity issues

---

#### 2. **Dual Role System**
**Issue**: Roles stored in TWO places:
1. `user_roles` table (flexible, many-to-many)
2. `players.role` column (single role per player)

**Recommendation**:
- ⚠️ Need to decide which is source of truth
- Implement sync mechanism or deprecate one system

---

#### 3. **Dual Ban System**
**Issue**: Bans stored in TWO places:
1. `banned_users` table
2. `users.is_banned` column

**Recommendation**:
- ⚠️ Ensure both are synced when banning/unbanning
- Or deprecate one system

---

#### 4. **Multiple Forum Systems**
**Issue**: Schema has TWO forum implementations:
1. Modern: `forum_categories`, `forum_posts`, `forum_comments`
2. Legacy: `forums`, `threads`, `posts`, `forum_threads`, `forum_replies`

**Recommendation**:
- ⚠️ Clarify which system is active
- Remove or migrate legacy tables

---

## API Endpoints That Need Verification

### User Management APIs:
- `/api/admin/users-list` - Verify query structure
- `/api/admin/delete-user-complete` - Verify cascading deletes
- `/api/admin/ban-user` - Verify syncs both ban systems
- `/api/admin/unban-user` - Verify syncs both ban systems

### System APIs:
- `/api/admin/sync-auth-database` - Critical: handle FK inconsistency
- `/api/admin/sync-missing-users` - Verify sync logic

### Transfer APIs:
- Any API querying "transfers" table - Should use "player_transfers"

---

## Testing Checklist

### High Priority:
- [ ] Test user deletion - verify cascading works
- [ ] Test ban/unban - verify both systems sync
- [ ] Test role assignment - verify both systems sync
- [ ] Test transfer recap - verify new query works
- [ ] Test auth sync - verify handles FK inconsistency

### Medium Priority:
- [ ] Test all user management pages load
- [ ] Test all team operations pages load
- [ ] Test all system tools pages load
- [ ] Test all content management pages load

### Low Priority:
- [ ] Verify all text colors are cyan/yellow
- [ ] Verify all backgrounds are dark
- [ ] Verify all dropdowns are dark

---

## Recommended Next Steps

1. **Fix Foreign Key Inconsistency** (CRITICAL)
   - Decide on `auth.users.id` vs `public.users.id`
   - Update all foreign keys to be consistent
   
2. **Consolidate Dual Systems**
   - Roles: Pick one system
   - Bans: Sync or consolidate
   - Forums: Remove legacy tables

3. **Test Critical Paths**
   - User deletion
   - User banning
   - Role assignment
   - Transfer queries

4. **Verify All API Endpoints**
   - Check each API matches schema
   - Add error handling for missing relationships

---

**Status**: ⚠️ **REQUIRES IMMEDIATE ATTENTION**
**Priority**: 🔴 **HIGH** - Schema inconsistencies will cause data integrity issues
**Estimated Effort**: 4-8 hours to fix critical issues
