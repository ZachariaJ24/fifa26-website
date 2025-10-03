# Vercel Environment Variables Setup

## Required Environment Variables for Production

Add these environment variables in your Vercel dashboard:

### Discord Configuration
```
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_guild_id
DISCORD_REGISTERED_ROLE_ID=your_registered_role_id
```

### Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://scs-fc-26.vercel.app
```

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (`fifa26-website`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. **Important:** Make sure to set them for **Production** environment
6. Redeploy your application

## Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2** → **General**
4. Add this redirect URI:
   ```
   https://scs-fc-26.vercel.app/api/auth/discord/callback
   ```
5. Save changes

## Testing

After setting up both Vercel environment variables and Discord redirect URI:

1. Test the OAuth flow: `https://scs-fc-26.vercel.app/api/auth/discord`
2. Check that it redirects to Discord without "Invalid OAuth2 redirect_uri" error
3. Complete the OAuth flow to verify it works end-to-end
