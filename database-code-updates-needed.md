# Database Code Updates Needed

After migrating from `teams`→`clubs` and `matches`→`fixtures`, the following files need to be updated:

## ✅ COMPLETED:
1. **app/api/standings/route.ts** - Updated teams→clubs, matches→fixtures, home_team_id/away_team_id→home_club_id/away_club_id
2. **app/api/matches/route.ts** - Updated matches→fixtures, home_team_id/away_team_id→home_club_id/away_club_id
3. **lib/standings-calculator-unified.ts** - Updated teams→clubs, matches→fixtures, home_team_id/away_team_id→home_club_id/away_club_id
4. **app/teams/[id]/page.tsx** - Updated matches→fixtures, home_team_id/away_team_id→home_club_id/away_club_id, team_id→club_id
5. **app/api/admin/sync-standings/route.ts** - Updated teams→clubs, matches→fixtures, home_team_id/away_team_id→home_club_id/away_club_id
6. **components/team-schedule/injury-reserve-button.tsx** - Updated team_id→club_id
7. **components/matches/ea-match-statistics.tsx** - Updated matches→fixtures, teams!→clubs!, home_team_id/away_team_id→home_club_id/away_club_id
8. **app/api/daily-recap/route.ts** - Updated matches→fixtures, teams→clubs, home_team_id/away_team_id→home_club_id/away_club_id
9. **components/free-agency/transfer-market-list.tsx** - Updated team_id→club_id, teams→clubs
10. **app/admin/awards/page.tsx** - Updated team_id→club_id, clubs:team_id→clubs:club_id

## 🔧 CRITICAL FILES THAT NEED UPDATES:

### High Priority API Routes:
1. **app/api/admin/sync-standings/route.ts** - Contains `FROM matches`
2. **lib/standings-calculator-unified.ts** - Contains `FROM matches` (2 matches)
3. **components/team-schedule/injury-reserve-button.tsx** - Contains `FROM matches` (2 matches)
4. **app/teams/[id]/page.tsx** - Contains `FROM matches`
5. **components/matches/ea-match-statistics.tsx** - Contains `FROM matches`
6. **components/admin/sync-standings-button.tsx** - Contains `FROM matches`
7. **lib/csv-utils.ts** - Contains `FROM matches`

### Files with team_id references (295 files total):
- **app/players/[id]/page.tsx** (31 matches)
- **app/api/daily-recap/route.ts** (27 matches)
- **components/matches/ea-match-statistics.tsx** (25 matches)
- **app/api/admin/team-availability/route.ts** (23 matches)
- **lib/team-utils.ts** (22 matches)
- **app/api/admin/daily-recap/route.ts** (21 matches)
- **app/api/recap/route.ts** (21 matches)
- **app/api/admin/bidding-recap/route.ts** (20 matches)
- **lib/standings-calculator.ts** (19 matches)

### Database Query Patterns to Find and Replace:
1. `FROM teams` → `FROM clubs`
2. `FROM matches` → `FROM fixtures`
3. `team_id` → `club_id`
4. `match_id` → `fixture_id`
5. `home_team_id` → `home_club_id`
6. `away_team_id` → `away_club_id`
7. `teams!home_team_id` → `clubs!home_club_id`
8. `teams!away_team_id` → `clubs!away_club_id`
9. `teams!team_id` → `clubs!club_id`

### Schema References:
- Table joins: `teams!` → `clubs!`
- Foreign key references in Supabase queries
- Column selections in SELECT statements

## TESTING CHECKLIST:
- [ ] Standings page loads correctly
- [ ] Matches page displays fixtures
- [ ] Team pages show club information
- [ ] Statistics calculations work
- [ ] Admin functions operate properly
- [ ] All API endpoints return data

## NOTES:
- The lint errors about missing modules (next/server, etc.) are unrelated to database changes
- Focus on functional database query updates first
- Test each major functionality after updates
