# CRITICAL: Table Name Fixes Required

## Date: October 4, 2025
## Priority: 🔴 **URGENT**

---

## ❌ **CRITICAL ISSUE FOUND**

Multiple admin pages are querying **`"teams"`** table which **DOES NOT EXIST** in the schema.

The correct table name is **`"clubs"`**.

---

## Files That Need Fixing

### 1. **Team Management Page** (`app/admin/teams/page.tsx`)
**Lines with Issues**: 297, 321, 345, 369, 393, 438, 699, 747, 761, 773, 903, 913, 948, 975

**Find & Replace**:
```typescript
// WRONG:
.from("teams")
.from('teams')

// CORRECT:
.from("clubs")
.from('clubs')
```

**Total Instances**: ~15+ occurrences

---

### 2. **Users Management Client** (`app/admin/users/UsersManagementClient.tsx`)
**Line**: 634

**Fix**:
```typescript
// WRONG:
const { data, error } = await supabase.from("teams").select("id, name").order("name")

// CORRECT:
const { data, error } = await supabase.from("clubs").select("id, name").order("name")
```

---

### 3. **Schedule Page (Old)** (`app/admin/schedule/page-old.tsx`)
**Line**: 361

**Fix**:
```typescript
// WRONG:
const { data, error } = await supabase.from("teams").select("id, name").order("name")

// CORRECT:
const { data, error } = await supabase.from("clubs").select("id, name").order("name")
```

---

### 4. **EA Stats Page (Old)** (`app/admin/ea-stats/page-old.tsx`)
**Line**: 70

**Fix**:
```typescript
// WRONG:
const { data, error } = await supabase.from("teams").select("*").order("name").not("ea_club_id", "is", null)

// CORRECT:
const { data, error } = await supabase.from("clubs").select("*").order("name").not("ea_club_id", "is", null)
```

---

### 5. **EA Matches Page** (`app/admin/ea-matches/[clubId]/page.tsx`)
**Line**: 73

**Fix**:
```typescript
// WRONG:
const { data: teamData, error: teamError } = await supabase
  .from("teams")
  .select("name")
  .eq("ea_club_id", clubId)
  .single()

// CORRECT:
const { data: clubData, error: clubError } = await supabase
  .from("clubs")
  .select("name")
  .eq("ea_club_id", clubId)
  .single()
```

---

### 6. **EA Matches Page (Old)** (`app/admin/ea-matches/page-old.tsx`)
**Line**: 70

**Fix**:
```typescript
// WRONG:
const { data, error } = await supabase.from("teams").select("*").order("name").not("ea_club_id", "is", null)

// CORRECT:
const { data, error } = await supabase.from("clubs").select("*").order("name").not("ea_club_id", "is", null)
```

---

## Automated Fix Script

Run this PowerShell script to fix all instances:

```powershell
$files = @(
  "app\admin\teams\page.tsx",
  "app\admin\users\UsersManagementClient.tsx",
  "app\admin\schedule\page-old.tsx",
  "app\admin\ea-stats\page-old.tsx",
  "app\admin\ea-matches\[clubId]\page.tsx",
  "app\admin\ea-matches\page-old.tsx"
)

foreach ($file in $files) {
  $fullPath = "C:\Users\Zacha\OneDrive\Documents\GitHub\fifa26-website\$file"
  if (Test-Path $fullPath) {
    $content = Get-Content $fullPath -Raw
    $content = $content -replace '\.from\("teams"\)', '.from("clubs")'
    $content = $content -replace "\.from\('teams'\)", ".from('clubs')"
    $content = $content -replace 'teamData', 'clubData'
    $content = $content -replace 'teamError', 'clubError'
    $content = $content -replace 'teamsData', 'clubsData'
    $content = $content -replace 'teamsError', 'clubsError'
    Set-Content -Path $fullPath -Value $content -NoNewline
    Write-Host "✅ Fixed: $file"
  } else {
    Write-Host "⚠️  Not found: $file"
  }
}
```

---

## Other Issues Found

### ❌ **Banned Users Table**
Some pages may still reference `banned_users` instead of using `users.is_banned`

**Check these files**:
- `app/admin/banned-users/page.tsx`

**Should query**:
```typescript
// CORRECT:
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('is_banned', true)
```

---

### ⚠️ **Token Balance Column**
**File**: `app/admin/tokens/page.tsx` (lines 117, 180)

**Issue**: Queries `users.token_balance` column

**Schema Check**: Does `users` table have `token_balance` column?
- ❌ **NO** - Schema shows separate `tokens` table with `balance` column

**Fix Required**:
```typescript
// WRONG:
const { data: usersData } = await supabase
  .from("users")
  .select("id, gamer_tag_id, token_balance")

// CORRECT:
const { data: usersData } = await supabase
  .from("users")
  .select(`
    id,
    gamer_tag_id,
    tokens!inner(balance)
  `)
```

---

## Summary of Critical Fixes

| File | Issue | Fix |
|------|-------|-----|
| `teams/page.tsx` | Uses `"teams"` table | Change to `"clubs"` |
| `UsersManagementClient.tsx` | Uses `"teams"` table | Change to `"clubs"` |
| `schedule/page-old.tsx` | Uses `"teams"` table | Change to `"clubs"` |
| `ea-stats/page-old.tsx` | Uses `"teams"` table | Change to `"clubs"` |
| `ea-matches/[clubId]/page.tsx` | Uses `"teams"` table | Change to `"clubs"` |
| `ea-matches/page-old.tsx` | Uses `"teams"` table | Change to `"clubs"` |
| `tokens/page.tsx` | Uses `users.token_balance` | Join to `tokens` table |
| `banned-users/page.tsx` | May use `banned_users` table | Use `users.is_banned` |

---

## Testing After Fixes

1. ✅ Team Management page loads
2. ✅ Can create/edit/delete clubs
3. ✅ Conference assignment works
4. ✅ EA Stats pages load
5. ✅ Schedule management works
6. ✅ Token management works
7. ✅ Banned users management works

---

**Status**: ❌ **BROKEN** - Pages will crash until fixed  
**Priority**: 🔴 **CRITICAL** - Fix immediately  
**Estimated Time**: 15-30 minutes
