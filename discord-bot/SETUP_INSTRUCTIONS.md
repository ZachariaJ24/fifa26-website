# SCSFC Discord Bot Setup Instructions

## Quick Setup

1. **Navigate to the bot directory:**
   ```bash
   cd discord-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the bot:**
   ```bash
   npm start
   ```

## Bot Features

### Authentication Commands
- `!link <username>` - Link Discord account to SCSFC account

### ELO System Commands
- `!register @username` - Register for ELO matches
- `!position C` - Set your hockey position (C, LW, RW, D, G)
- `!join` - Join a competitive lobby
- `!pick @player` - Pick player for team (captains only)
- `!start` - Begin the match (captains only)
- `!result <score1> <score2>` - Report match result
- `!stats` - Show your ELO statistics
- `!rankings` - Show top 10 ELO rankings
- `!help` - Show ELO command help

## Configuration

The bot is pre-configured with:
- **Discord Server ID:** 1420630992757985333
- **Bot Token:** [Configured in .env file]
- **Supabase URL:** https://trbiauopjscaqftfhmbg.supabase.co
- **Verified Role ID:** 1420812444649132116

## Role Management

The bot automatically assigns roles based on:
- **Signup Role:** Assigned when user successfully links with `!link`
- **Management Roles:** Owner, GM, AGM based on database assignments
- **Admin Role:** Assigned when user has admin privileges

## Troubleshooting

If the bot doesn't start:
1. Check that Node.js is installed
2. Verify the .env file exists with correct credentials
3. Check Discord bot permissions in the server
4. Ensure the bot is invited to the Discord server

## Support

For issues or questions, check the console logs for specific error messages.
