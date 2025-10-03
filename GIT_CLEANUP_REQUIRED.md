# Git Cleanup Required - Exposed Secrets

## Problem
GitHub is blocking pushes because Discord Bot Token and other secrets were committed to the repository history.

## What Was Exposed
- Discord Bot Token in `VERCEL_ENVIRONMENT_SETUP.md`
- Discord Client Secret
- Supabase Service Role Key

## Immediate Actions Required

### 1. **CRITICAL: Rotate All Exposed Secrets**
You must immediately rotate these secrets in their respective services:

#### Discord
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **Bot** section
4. Click **Reset Token** to generate a new bot token
5. Go to **OAuth2** section
6. Click **Reset Secret** to generate a new client secret
7. Update these in your Vercel environment variables

#### Supabase
1. Go to your Supabase dashboard
2. Go to **Settings** → **API**
3. Generate a new service role key
4. Update in Vercel environment variables

### 2. Clean Git History
Since the secrets are in git history, you have two options:

#### Option A: Use BFG Repo-Cleaner (Recommended)
```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh bare copy
git clone --mirror https://github.com/ZachariaJ24/fifa26-website.git

# Remove the file from history
bfg --delete-files VERCEL_ENVIRONMENT_SETUP.md fifa26-website.git

# Clean up
cd fifa26-website.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

#### Option B: Use git filter-branch
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch VERCEL_ENVIRONMENT_SETUP.md" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

#### Option C: Start Fresh (Easiest but loses history)
```bash
# Create a new branch without history
git checkout --orphan new-main
git add -A
git commit -m "Fresh start with secrets removed"
git branch -D main
git branch -m main
git push -f origin main
```

## Prevention
1. ✅ Secrets removed from current files
2. ✅ `.gitignore` should include `.env` files
3. ⚠️ Need to clean git history
4. ⚠️ Need to rotate all exposed secrets

## Current Status
- ✅ Merge conflicts resolved
- ✅ Secrets removed from current files
- ❌ Git history still contains secrets (blocking push)
- ❌ Exposed secrets need rotation

## Next Steps
1. **FIRST**: Rotate all secrets (Discord bot token, client secret, Supabase key)
2. **SECOND**: Clean git history using one of the options above
3. **THIRD**: Push cleaned repository
4. **FOURTH**: Update Vercel environment variables with new secrets
5. **FIFTH**: Test the application

## Files That Need History Cleanup
- `VERCEL_ENVIRONMENT_SETUP.md`
- Any other files that may have contained secrets

## Important Notes
- Do NOT skip rotating the secrets - they are now public
- The git history cleanup is required before you can push
- After cleanup, all team members will need to re-clone the repository
