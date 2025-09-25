# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_GUILD_ID=1420630992757985333
DISCORD_REGISTERED_ROLE_ID=1420812444649132116
DISCORD_CLIENT_ID=1423504252508307476
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://trbiauopjscaqftfhmbg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Security Notes

- **Never commit `.env` files to version control**
- The `.gitignore` file already excludes `.env*` files
- Use `.env.local` for local development
- Use your hosting platform's environment variable settings for production

## Bot Setup

1. Copy the Discord bot token to your `.env.local` file
2. Update the admin panel to use the environment variables
3. Restart your development server
4. The bot configuration will be loaded from environment variables

## Discord Bot Directory

The Discord bot files are in the `discord-bot/` directory with their own `.env` file. This is separate from the main application environment variables.
