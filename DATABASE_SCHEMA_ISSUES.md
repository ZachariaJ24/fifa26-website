# Database Schema Issues - Admin Pages

## Date: October 4, 2025

## Problem Summary
The admin pages are experiencing database errors because they reference incorrect tables and terminology. The application is for **FIFA (Soccer/Football)**, not hockey or other sports.

## Current Database Schema (Soccer/Football)

### Key Tables:
- ✅ `clubs` - Teams in the league
- ✅ `players` - Player roster management
- ✅ `fixtures` - Matches/games
- ✅ `player_transfers` - Player transfers between clubs
- ✅ `player_signings` - New player signings
- ✅ `transfer_listings` - Players listed for transfer
- ✅ `transfer_offers` - Transfer offers from clubs
- ✅ `waivers` - Waiver system
- ✅ `seasons` - Season management
- ✅ `users` - User accounts
- ✅ `tokens` - Token/currency system
- ✅ `ea_player_stats` - EA Sports FIFA player statistics
- ✅ `ea_club_stats` - EA Sports FIFA club statistics
- ✅ `ea_match_data` - EA Sports FIFA match data

### Incorrect References Found:

#### 1. **"Bidding Recap" Page** ❌
- **Current Name**: Bidding Recap
- **Should Be**: Transfer Recap
- **Tables to Use**: 
  - `player_transfers`
  - `player_signings`
  - `transfer_listings`
  - `transfer_offers`

#### 2. **Salary Cap References** ⚠️
- **Schema Has**: `clubs.salary_cap` (default 65,000,000)
- **Schema Has**: `clubs.total_retained_salary`
- **Schema Has**: `players.salary`
- **Schema Has**: `players.retained_salary`
- This is correct for FIFA/Soccer leagues

#### 3. **Token System** ✅
- Correctly implemented in schema
- Tables: `tokens`, `token_transactions`, `token_redemptions`, `token_redeemables`

## Admin Pages That Need Fixing

### High Priority Fixes:

#### 1. **Transfer Recap Page** (currently "Bidding Recap")
**File**: `app/admin/transfer-recap/page.tsx`
**Issues**:
- May be querying wrong tables
- Terminology needs update (bidding → transfers)
- Should query: `player_transfers`, `player_signings`, `transfer_listings`

#### 2. **System Settings Page**
**File**: `app/admin/settings/AdminSettingsPageClient.tsx`
**Current Tabs**:
- Transfers ✅
- Signings ✅
- IP Tracking ✅
- User Transfers ✅
- Seasons ✅
- Standings ✅

**Potential Issues**:
- May have incorrect queries for transfer/signing data
- Check if it's querying correct tables

#### 3. **SCS Bot / Discord Bot Pages**
**Files**: 
- `app/admin/scs-bot/page.tsx`
- `app/admin/setup-bot-config/page.tsx`

**Schema Tables**:
- `discord_bot_config` ✅
- `discord_users` ✅
- `discord_club_roles` ✅

**Potential Issues**:
- Check if queries match schema structure
- Verify column names match

#### 4. **User Management Pages**
**Potential Issues**:
- Users table has both `users` (public) and `auth.users` (Supabase auth)
- Need to ensure proper joins between tables
- `players` table links to `users.id`, not `auth.users.id`

#### 5. **Role Sync Fix Page**
**File**: `app/admin/role-sync/page.tsx`
**Schema Tables**:
- `user_roles` - Links users to roles
- `roles` - Role definitions
- `players` - Has a `role` column (Player, GM, AGM, Owner)

**Potential Issues**:
- Dual role system: `user_roles` table AND `players.role` column
- May need to sync between both

#### 6. **Sync Missing Users Page**
**File**: `app/admin/sync-missing-users/page.tsx`
**Potential Issues**:
- Needs to sync between `auth.users` and `public.users`
- Check if queries are correct

## Recommended Fixes

### 1. Update Transfer Recap Page
```typescript
// Query player_transfers instead of "bids"
const { data: transfers } = await supabase
  .from('player_transfers')
  .select(`
    *,
    player:players(user:users(gamer_tag_id)),
    from_club:clubs!from_club_id(name),
    to_club:clubs!to_club_id(name)
  `)
  .order('created_at', { ascending: false })
```

### 2. Fix User/Player Relationship
```typescript
// Users table structure
interface User {
  id: uuid // Primary key
  email: string
  gamer_tag_id: string
  discord_name: string
  club_id: uuid // Direct club relationship
  // ... other fields
}

// Players table structure  
interface Player {
  id: uuid // Primary key
  user_id: uuid // Foreign key to users.id
  club_id: uuid // Foreign key to clubs.id
  salary: number
  role: 'Player' | 'GM' | 'AGM' | 'Owner'
  // ... other fields
}
```

### 3. Fix Role Sync
```typescript
// Need to sync both:
// 1. user_roles table (flexible role system)
// 2. players.role column (legacy/simple role)

const syncRoles = async (userId: uuid) => {
  // Get roles from user_roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  
  // Get role from players table
  const { data: player } = await supabase
    .from('players')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  // Sync logic here
}
```

### 4. Fix Discord Bot Config
```typescript
// Correct schema structure
interface DiscordBotConfig {
  id: uuid
  guild_id: string // Discord server ID
  bot_token: string // Bot token
  registered_role_id: string // Role ID for registered users
  created_at: timestamp
  updated_at: timestamp
}
```

## Common Error Patterns

### 1. Foreign Key Mismatches
❌ **Wrong**: Querying `auth.users.id` when should query `public.users.id`
✅ **Right**: Use `public.users.id` for most relationships

### 2. Missing Joins
❌ **Wrong**: Querying `players` without joining to `users` for gamer tag
✅ **Right**: Always join `players -> users` to get user details

### 3. Incorrect Table Names
❌ **Wrong**: Querying "bids" or "bidding" tables (don't exist)
✅ **Right**: Query `player_transfers`, `player_signings`, `transfer_listings`

## Testing Checklist

- [ ] Transfer Recap page loads without errors
- [ ] System Settings page loads and displays correct data
- [ ] SCS Bot page connects to `discord_bot_config` table
- [ ] Setup Bot Config page can read/write config
- [ ] Sync Missing Users syncs between `auth.users` and `public.users`
- [ ] Role Sync Fix syncs `user_roles` and `players.role`
- [ ] All user management pages show correct data
- [ ] Token system pages query `tokens` table correctly

## Next Steps

1. **Identify Exact Errors**: Check browser console for specific SQL errors
2. **Fix Table References**: Update queries to match actual schema
3. **Update Terminology**: Change "bidding" to "transfers" throughout
4. **Test Each Page**: Verify queries return expected data
5. **Add Error Handling**: Gracefully handle missing data/relationships

---

**Status**: ⚠️ **Requires Immediate Attention**
**Priority**: 🔴 **HIGH** - Pages are currently broken
