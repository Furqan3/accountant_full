# OAuth Setup Guide (Google & Apple)

This guide will help you set up Google OAuth and Apple Sign In for your application.

---

## Part 1: Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - Choose **External** user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Accountant App`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (for development)
     - `https://your-production-domain.com/api/auth/callback` (for production)
     - **IMPORTANT:** Also add your Supabase callback URL:
       - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

7. Click **Create** and save your:
   - **Client ID**
   - **Client Secret**

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to expand
5. Toggle **Enable Sign in with Google** to ON
6. Enter your Google credentials:
   - **Client ID** (from Step 1)
   - **Client Secret** (from Step 1)
7. Copy the **Callback URL** shown (you already added this to Google Console in Step 1)
8. Click **Save**

### Step 3: Test Google OAuth

Your Google OAuth is now configured! The signin/signup forms already have the code to handle Google authentication.

---

## Part 2: Apple Sign In Setup

### Step 1: Apple Developer Account Setup

1. You need an **Apple Developer Account** ($99/year)
2. Go to [Apple Developer Portal](https://developer.apple.com/)
3. Navigate to **Certificates, Identifiers & Profiles**

### Step 2: Create App ID

1. Click **Identifiers** → **+** (plus button)
2. Select **App IDs** → **Continue**
3. Select **App** → **Continue**
4. Fill in:
   - **Description:** `Accountant App`
   - **Bundle ID:** `com.yourcompany.accountant` (use reverse domain notation)
   - **Capabilities:** Check **Sign In with Apple**
5. Click **Continue** → **Register**

### Step 3: Create Services ID

1. Click **Identifiers** → **+** (plus button)
2. Select **Services IDs** → **Continue**
3. Fill in:
   - **Description:** `Accountant App Web`
   - **Identifier:** `com.yourcompany.accountant.web`
4. Click **Continue** → **Register**
5. Click on the Services ID you just created
6. Check **Sign In with Apple**
7. Click **Configure** next to Sign In with Apple
8. Configure:
   - **Primary App ID:** Select the App ID created in Step 2
   - **Website URLs:**
     - Domains: `localhost:3000` (dev), `your-production-domain.com` (prod)
     - Return URLs:
       - `http://localhost:3000/api/auth/callback` (dev)
       - `https://your-production-domain.com/api/auth/callback` (prod)
       - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback` (Supabase)
9. Click **Save** → **Continue** → **Save**

### Step 4: Create Private Key

1. Go to **Keys** → **+** (plus button)
2. Fill in:
   - **Key Name:** `Accountant App Sign In Key`
   - Check **Sign In with Apple**
3. Click **Configure** → Select your **Primary App ID**
4. Click **Save** → **Continue** → **Register**
5. **Download** the key file (`.p8` file) - you can only download once!
6. Note down the **Key ID** shown

### Step 5: Get Team ID

1. Go to **Membership** in Apple Developer Portal
2. Copy your **Team ID**

### Step 6: Configure Supabase for Apple

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find **Apple** in the list and click to expand
4. Toggle **Enable Sign in with Apple** to ON
5. Enter your Apple credentials:
   - **Services ID:** (from Step 3, e.g., `com.yourcompany.accountant.web`)
   - **Team ID:** (from Step 5)
   - **Key ID:** (from Step 4)
   - **Private Key:** Open the `.p8` file in a text editor and paste the entire contents
6. Copy the **Callback URL** shown (you already added this in Step 3)
7. Click **Save**

---

## Part 3: Update Your Code

### The code is already set up! Here's what's configured:

**Sign In Page (`components/auth/signin-form.tsx`):**
```typescript
const handleGoogleSignIn = async () => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
}

const handleAppleSignIn = async () => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
}
```

**Sign Up Page (`components/auth/signup-form.tsx`):**
- Same OAuth handlers already implemented

**Callback Handler (`app/api/auth/callback/route.ts`):**
- Already handles the OAuth callback and redirects properly

---

## Part 4: Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

That's it! No additional environment variables needed for OAuth.

---

## Testing

### Test Google OAuth:
1. Go to `/signin` or `/signup`
2. Click the **Google** button
3. Sign in with your Google account
4. You should be redirected back and logged in

### Test Apple Sign In:
1. Go to `/signin` or `/signup`
2. Click the **Apple** button
3. Sign in with your Apple ID
4. You should be redirected back and logged in

---

## Troubleshooting

### Google OAuth Issues:

**"Redirect URI mismatch"**
- Make sure you added the exact redirect URI to Google Console
- Check that the Supabase callback URL is added

**"Access blocked: This app's request is invalid"**
- Complete the OAuth consent screen configuration
- Add test users if the app is in testing mode

### Apple Sign In Issues:

**"invalid_client"**
- Double-check your Services ID
- Verify the private key is correct (entire `.p8` file contents)
- Ensure Team ID and Key ID are correct

**"redirect_uri_mismatch"**
- Make sure all redirect URIs are added to the Services ID configuration
- Check that domains don't include `http://` or `https://` (just the domain)

### General Issues:

**OAuth works in development but not production**
- Add your production domain to all provider configurations
- Update redirect URIs with production URLs
- Check that `.env` variables are set in production

**User data not saving to profiles table**
- Check that you have the database trigger set up (see `supabase-schema.sql`)
- The trigger should create a profile entry when a new user signs up

---

## Security Notes

- **Never commit** your:
  - Google Client Secret
  - Apple Private Key (`.p8` file)
  - Supabase Service Role Key
- Store these in environment variables or secure secret management
- Use different OAuth credentials for development and production
- Enable only the OAuth providers you plan to use

---

## Quick Reference

### Google Console
- URL: https://console.cloud.google.com/
- OAuth Credentials: APIs & Services → Credentials

### Apple Developer
- URL: https://developer.apple.com/account
- Configuration: Certificates, Identifiers & Profiles

### Supabase Dashboard
- URL: https://supabase.com/dashboard
- OAuth Settings: Authentication → Providers

---

Your OAuth authentication is now ready! 🎉
