# SCSFC Bot Migration Guide

## ✅ Completed Updates

The following files have been updated for SCSFC migration:

### 1. Bot Files Updated
- `enhanced-bot.js` - Updated with SCSFC branding and new role IDs
- `fixed-enhanced-bot.js` - Updated with SCSFC branding and new role IDs  
- `index.js` - Updated with SCSFC branding and new role IDs
- `package.json` - Updated name and description

### 2. New Role Configuration
```javascript
const ROLES = {
  SIGNUP: "1420812476366459001",
  LEAGUE_BLOG: "1420812513557217290", 
  CLUB_OWNER: "1420812555227762729",
  DIRECTOR: "1420812610915274902",
  MANAGER: "1420812643962323065",
  VERIFIED: "1420812444649132116"
  // No team roles for SCSFC
};
```

### 3. Supabase Configuration
- URL: `https://trbiauopjscaqftfhmbg.supabase.co`
- Service Key: `[Configured in .env file]`

## ✅ All Updates Complete!

### Discord Server ID Updated
```javascript
const GUILD_ID = "1420630992757985333";
```

### 2. Environment Variables ✅ READY
Create a `.env` file with these exact values:
```
DISCORD_BOT_TOKEN=your_discord_bot_token_here
SUPABASE_URL=https://trbiauopjscaqftfhmbg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 🚀 Final Steps

1. ✅ **Discord Server ID**: Updated to `1420630992757985333`
2. ✅ **GUILD_ID**: Updated in all bot files
3. ✅ **Bot Token**: Provided and ready to use
4. **Create .env file**: Copy the environment variables above into a new `.env` file
5. **Test the bot**: Run `node enhanced-bot.js` or `node fixed-enhanced-bot.js`

## 📝 Changes Made

- ✅ Updated all "SCS" references to "SCSFC"
- ✅ Updated role IDs to new SCSFC server roles
- ✅ Removed team roles (not needed for SCSFC)
- ✅ Updated Supabase configuration
- ✅ Updated package.json metadata
- ✅ Updated bot activity and console messages
