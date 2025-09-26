# Frontend Systems Rebuild Plan

## 1. Teams System Rebuild

### New Teams API Routes
- `/api/teams` - Get all teams with conference info
- `/api/teams/[id]` - Get specific team details
- `/api/admin/teams` - Admin team management

### New Teams Components
- `TeamCard` - Display team with conference colors
- `TeamStandings` - Show team in standings table
- `ConferenceStandings` - Group teams by conference

## 2. Standings System Rebuild

### New Standings API Routes
- `/api/standings` - Get current standings
- `/api/standings/conference/[id]` - Get conference standings
- `/api/admin/standings/sync` - Sync standings

### New Standings Components
- `StandingsTable` - Unified standings display
- `ConferenceStandingsCard` - Conference-specific standings
- `TeamStandingRow` - Individual team row

## 3. Stats System Rebuild

### New Stats API Routes
- `/api/stats/teams` - Team statistics
- `/api/stats/players` - Player statistics
- `/api/admin/stats/sync` - Sync all stats

### New Stats Components
- `TeamStatsCard` - Team performance metrics
- `PlayerStatsTable` - Player statistics table
- `StatsSyncButton` - Admin sync tool

## 4. Matches System Rebuild

### New Matches API Routes
- `/api/matches` - Get matches with team info
- `/api/matches/[id]` - Get specific match
- `/api/admin/matches` - Admin match management

### New Matches Components
- `MatchCard` - Display match with team logos
- `MatchList` - List of matches
- `MatchForm` - Admin match creation/editing

## 5. Transfer Market Rebuild

### New Transfer API Routes
- `/api/transfers/offers` - Transfer offers
- `/api/transfers/signings` - Direct signings
- `/api/transfers/status` - Market status
- `/api/admin/transfers` - Admin transfer management

### New Transfer Components
- `TransferOfferCard` - Display transfer offer
- `SigningForm` - Direct signing form
- `TransferMarket` - Main transfer interface
- `TransferHistory` - Completed transfers

## 6. Transfer Recap Rebuild

### New Recap API Routes
- `/api/recap/transfers` - Transfer recap data
- `/api/recap/daily` - Daily recap
- `/api/admin/recap` - Admin recap management

### New Recap Components
- `TransferRecap` - Transfer activity summary
- `DailyRecap` - Daily activity summary
- `RecapSettings` - Admin recap settings

## 7. News Daily Recap Rebuild

### New News API Routes
- `/api/news` - Get news articles
- `/api/news/daily` - Daily news
- `/api/admin/news` - Admin news management

### New News Components
- `NewsCard` - News article display
- `NewsList` - List of news articles
- `NewsForm` - Admin news creation

## 8. Forum System Rebuild

### New Forum API Routes
- `/api/forum/posts` - Forum posts
- `/api/forum/replies` - Post replies
- `/api/forum/votes` - Post voting
- `/api/admin/forum` - Admin forum management

### New Forum Components
- `ForumPost` - Individual forum post
- `ForumReply` - Post reply
- `ForumList` - List of forum posts
- `ForumForm` - Create new post/reply

## Implementation Order

1. **Teams System** - Foundation for everything else
2. **Standings System** - Depends on teams
3. **Matches System** - Depends on teams
4. **Stats System** - Depends on matches
5. **Transfer Market** - Depends on teams
6. **Transfer Recap** - Depends on transfers
7. **News System** - Independent
8. **Forum System** - Independent

## Key Features

- **Unified Data Flow** - All systems use the same data sources
- **Real-time Updates** - Automatic stats synchronization
- **Admin Controls** - Full admin management for all systems
- **Responsive Design** - Mobile-friendly interfaces
- **Error Handling** - Comprehensive error management
- **Loading States** - Proper loading indicators
- **Type Safety** - Full TypeScript support
