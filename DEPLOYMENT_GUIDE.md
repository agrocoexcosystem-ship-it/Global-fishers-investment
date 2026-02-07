# Deployment Guide for Global Fishers Investment

This guide covers how to deploy your **React (Vite) + Supabase** application to production.

## 1. Hosting Options (Frontend)
Since your app is built with Vite, it is a "Static SPA" (Single Page Application). The best (and usually free) hosting providers are:

*   **Netlify** (Recommended for simplicity)
*   **Vercel** (Great performance, optimized for Next.js but works great with Vite)

### Deployment Steps (Netlify Example):
1.  **Push your code to GitHub**. (If you haven't already, create a repo and push this project).
2.  Log in to [Netlify](https://www.netlify.com/).
3.  Click **"Add new site"** -> **"Import an existing project"**.
4.  Select your GitHub repository.
5.  **Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
6.  **Environment Variables**:
    *   Click "Show advanced" or go to "Site Settings" > "Environment variables".
    *   Add the variables from your local `.env` file:
        *   `VITE_SUPABASE_URL`: (Your Supabase URL)
        *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
7.  Click **Deploy**.

## 2. Supabase Configuration (Backend)
Before going live, you must configure Supabase to accept traffic from your new live URL.

### A. Authentication URL Configuration
1.  Go to your **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2.  **Site URL**: Change this from `http://localhost:3000` to your new production URL (e.g., `https://global-fishers.netlify.app`).
3.  **Redirect URLs**: Add your production URL + any sub-paths if necessary.
    *   Example: `https://global-fishers.netlify.app/**`

### B. Database & Security
*   **Row Level Security (RLS)**: We have already enabled RLS in `supabase_schema.sql`. This is critical. Ensure no policies are set to `true` for everyone unless intended (like reading public plans).
*   **Table Editor**: Check your `profiles` and `transactions` tables. Ensure there isn't excessive test data you want to wipe before launch.

## 3. Post-Deployment Checks
Once the site is live:
1.  **Test Sign Up**: Create a new account on the live site. Verify you receive the email (if email confirmation is on) or that you can log in.
2.  **Test Admin Access**:
    *   Log in with your admin account.
    *   Go to `/admin` (or click the Admin link if visible).
    *   **Note**: If you cannot access the admin panel, ensure your user `role` in the `profiles` table is set to `'admin'` manually in the Supabase Dashboard, as new signups are `'user'` by default.
3.  **Smartsupp**: Verify the chat widget appears and works.
4.  **refresh**: If you get "404 Not Found" when refreshing pages like `/dashboard`, you need to configure a `_redirects` file for Netlify.

### Fixing "Page Not Found" on Refresh (SPA Issue)
If you use Netlify, create a file named `public/_redirects` (no extension) with this content:
```
/*  /index.html  200
```
This ensures React Router handles all the routing.

## 4. Professional Domain
To look professional (e.g., `www.globalfishers.com`):
1.  Buy a domain from Namecheap, GoDaddy, etc.
2.  In Netlify/Vercel, go to **Domain Management**.
3.  Add your custom domain.
4.  Follow the instructions to update your DNS records (usually an A Record or CNAME) on your domain registrar.
5.  **SSL/HTTPS** will be provisioned automatically by Netlify/Vercel.

## 5. Summary Checklist
- [ ] Code pushed to GitHub.
- [ ] Connect repo to Netlify/Vercel.
- [ ] Add `VITE_SUPABASE_...` environment variables in hosting settings.
- [ ] Update Supabase "Site URL" to production domain.
- [ ] Add `public/_redirects` file (if using Netlify).
- [ ] Test Sign Up and Admin Login on live site.
