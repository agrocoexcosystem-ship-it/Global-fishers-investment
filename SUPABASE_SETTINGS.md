# Supabase Auth Rate Limit Fix

The error **"Email rate limit exceeded"** implies that too many sign-up requests have been sent from your IP address or to a specific email endpoint in a short time. This is a default security setting in Supabase.

Since you are in development mode, you should relax these limits.

## 1. Disable/Increase Rate Limits (Recommended for Dev)
1. Log in to your **Supabase Dashboard**.
2. Select your project (**global-fishers-investment**).
3. Go to **Authentication** (icon on the left) -> **Rate Limits**.
4. Adjust the following:
   - **Email Signups per hour**: Increase to `100` or higher (default is often 3).
   - **Email Signups from the same IP**: Increase this limit similarly.
5. Click **Save**.

## 2. Disable Email Confirmation (Optional)
If you just want to test without clicking email links:
1. Go to **Authentication** -> **Providers** -> **Email**.
2. Turn **OFF** "Confirm email".
3. Click **Save**.

## 3. Clear existing "Pending" users
If your database is collecting incomplete signups:
1. Go to **Table Editor** -> `auth.users` (schema `auth`).
2. You can manually delete test users here if you want to reuse emails (though usually unique email is required).

After making these changes, try signing up again on your localhost app.
