# 🏒 SCS Enhanced Bot - Integration Guide

This guide explains how the enhanced SCS bot integrates your existing authentication system with the new ELO competitive system.

## 🔗 **What This Bot Does**

### **Existing SCS Functions (Maintained)**
- ✅ **Account Linking**: `!link <username>` - Links Discord to SCS account
- ✅ **Role Assignment**: Automatically assigns roles based on team assignments
- ✅ **Team Management**: Syncs team roles when players are assigned to teams
- ✅ **Management Roles**: Assigns Owner/GM/AGM roles based on database
- ✅ **Signup Verification**: Assigns signup role after successful linking

### **New ELO Functions (Added)**
- 🆕 **ELO Registration**: `!register @username` - Register for competitive matches
- 🆕 **Position Setting**: `!position C/LW/RW/D/G` - Set hockey position
- 🆕 **Lobby System**: `!join` - Join 12-player competitive lobbies
- 🆕 **Team Formation**: `!pick @player` - Captains pick balanced teams
- 🆕 **Match Management**: `!start` and `!result` - Handle competitive matches
- 🆕 **Statistics**: `!stats` and `!rankings` - View ELO performance

## 🎯 **Integration Points**

### **1. Authentication Flow**
```
Discord User → !link <username> → SCS Account Verified → Signup Role Assigned
```

### **2. Team Assignment Flow**
```
Player Wins Bid → Database Updated → Bot Detects Change → Team Role Assigned
```

### **3. ELO System Flow**
```
Verified Player → !register @username → !position C → !join → Competitive Match
```

## 🚀 **Setup Instructions**

### **Step 1: Update Your Bot**
1. **Backup your current bot**:
   ```bash
   cp index.js index.js.backup
   ```

2. **Replace with enhanced version**:
   ```bash
   cp enhanced-bot.js index.js
   ```

3. **Update package.json** (if needed):
   ```bash
   npm install discord.js@^14.19.3
   ```

### **Step 2: Environment Variables**
Ensure your `.env` file has:
```env
DISCORD_BOT_TOKEN=your_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### **Step 3: Database Setup**
Run the ELO migration in Supabase:
```sql
-- Copy and paste sql/migrations/004_create_elo_system.sql
```

### **Step 4: Test the Bot**
```bash
npm start
```

## 📋 **Available Commands**

### **SCS Authentication Commands**
| Command | Usage | Description |
|---------|-------|-------------|
| `!link` | `!link <username>` | Link Discord to SCS account |

### **ELO System Commands**
| Command | Usage | Description |
|---------|-------|-------------|
| `!register` | `!register @username` | Register for ELO matches |
| `!position` | `!position C` | Set your hockey position |
| `!join` | `!join` | Join a competitive lobby |
| `!pick` | `!pick @player` | Pick player for team (captains) |
| `!start` | `!start` | Begin the match (captains) |
| `!result` | `!result <score1> <score2>` | Report match result |
| `!stats` | `!stats` | Show your ELO statistics |
| `!rankings` | `!rankings` | Show top 10 ELO rankings |
| `!help` | `!help` | Show ELO command help |

## 🔄 **How Role Assignment Works**

### **Automatic Role Assignment**
The bot automatically assigns roles based on your database:

1. **Signup Role** (`1407949223206457404`)
   - Assigned when user successfully links with `!link`
   - Required for ELO participation

2. **Team Roles** (e.g., `Bulldogs: 1411423563147251722`)
   - Assigned when `players.team_id` is set in database
   - Automatically removed if team assignment changes

3. **Management Roles**
   - **Owner** (`1345974608561700976`) - When `players.role = "Owner"`
   - **GM** (`1345974651037290540`) - When `players.role = "GM"`
   - **AGM** (`1379812785529032885`) - When `players.role = "AGM"`

4. **Admin Role**
   - Assigned when `user_roles.role = "Admin"`

### **Role Synchronization**
- Bot runs `syncAllUserRoles()` on startup
- Automatically syncs roles every 5 seconds during startup
- Maintains role consistency with database state

## 🏆 **ELO System Integration**

### **Player Flow**
1. **Link Account**: `!link <username>` (gets signup role)
2. **Register for ELO**: `!register @username` (creates ELO profile)
3. **Set Position**: `!position C` (C, LW, RW, D, G)
4. **Join Lobby**: `!join` (waits for 12 players)
5. **Team Formation**: Captains pick balanced teams
6. **Match Play**: `!start` → play → `!result <score1> <score2>`

### **Rating System**
- **Initial Rating**: 1200
- **Win**: +15 rating, +3 points
- **Loss**: -15 rating, +0 points
- **Tiers**: Beginner → Intermediate → Advanced → Expert → Master → Grandmaster

## 🔧 **Configuration Options**

### **ELO Settings** (in `enhanced-bot.js`)
```javascript
const ELO_CONFIG = {
  prefix: '!',                    // Command prefix
  lobbyTimeout: 15 * 60 * 1000,  // 15 minutes
  maxPlayers: 12,                 // Players per match
  positions: ['C', 'LW', 'RW', 'D', 'G'],
  pointsPerWin: 3,               // Points for winning
  pointsPerLoss: 0,              // Points for losing
  pointsPerDraw: 1               // Points for drawing
};
```

### **Role IDs** (in `enhanced-bot.js`)
```javascript
const ROLES = {
  SIGNUP: "1407949223206457404",
  TEAM_OWNER: "1345974608561700976",
  GM: "1345974651037290540",
  AGM: "1379812785529032885",
  TEAMS: {
    BULLDOGS: "1411423563147251722",
    TORONTO_NORTHMEN: "1411423756538089662",
    // ... all your team roles
  }
};
```

## 📊 **Database Integration**

### **Existing Tables Used**
- `users` - SCS user accounts
- `discord_users` - Discord-SCS linking
- `players` - Team assignments and roles
- `user_roles` - Admin and management permissions
- `discord_team_roles` - Team role mappings
- `discord_management_roles` - Management role mappings

### **New ELO Tables Created**
- `elo_players` - ELO player profiles
- `elo_matches` - Match results
- `elo_match_players` - Individual player performance
- `elo_lobbies` - Lobby management
- `elo_lobby_players` - Players in lobbies
- `elo_settings` - Configurable ELO settings

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Bot Not Responding to ELO Commands**
   - Check if bot is online
   - Verify command prefix (default: `!`)
   - Check console for error messages

2. **Role Assignment Not Working**
   - Verify database connections
   - Check if `syncAllUserRoles()` ran on startup
   - Verify role IDs match your Discord server

3. **ELO System Errors**
   - Check if ELO migration was run
   - Verify Supabase permissions
   - Check console for specific error messages

### **Debug Commands**
- **Bot Status**: Look for "✅ SCS Enhanced Bot is online"
- **Role Sync**: Look for "🔄 Starting role synchronization..."
- **ELO System**: Test with `!help` command

## 🔄 **Migration from Old Bot**

### **What Changes**
1. **File**: `index.js` → `enhanced-bot.js`
2. **New Commands**: All ELO system commands
3. **Enhanced Role Management**: Better synchronization
4. **New Database Tables**: ELO system tables

### **What Stays the Same**
1. **Authentication**: `!link` command unchanged
2. **Role Logic**: Same role assignment rules
3. **Database**: All existing tables and relationships
4. **Environment**: Same environment variables

## 🎯 **Next Steps After Setup**

### **1. Test Basic Functions**
- Test `!link` with a test account
- Verify signup role assignment
- Test team role assignment

### **2. Test ELO System**
- Register a test player with `!register @username`
- Set position with `!position C`
- Test lobby system with `!join`

### **3. Community Integration**
- Announce the new ELO system
- Create dedicated ELO channels
- Set up regular tournaments

## 📞 **Support**

If you encounter issues:

1. **Check Console Logs**: Look for specific error messages
2. **Verify Database**: Ensure ELO migration ran successfully
3. **Test Commands**: Use `!help` to verify ELO system is working
4. **Check Permissions**: Ensure bot has proper Discord permissions

## 🎉 **Success Indicators**

Your enhanced bot is working when you see:

- ✅ **Startup**: "SCS Enhanced Bot is online" + "Starting role synchronization..."
- ✅ **Authentication**: `!link` successfully assigns signup role
- ✅ **ELO System**: `!help` shows all ELO commands
- ✅ **Role Sync**: Automatic role assignment based on database changes

---

**Your SCS bot now handles both authentication AND competitive ELO matches! 🏒🎮**
