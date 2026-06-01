# NovaVest Capital

A premium crypto investment SaaS starter built with Next.js App Router, TypeScript, Tailwind CSS v4, Supabase Auth/Database, Framer Motion, React Query, Recharts, Zustand, and Resend/Nodemailer transactional emails.

> Important: This codebase is a production-ready starter architecture, not a legal or financial compliance package. Before launch, review securities, consumer-protection, AML/KYC, taxation, and marketing regulations in your operating jurisdiction. The plan values are implemented as configurable projected plan terms in the database.

## Features

- Premium fintech landing page with hero, live stats, investment plans, transaction feed, testimonials, FAQ, newsletter, and responsive footer.
- Supabase email/password authentication with custom NovaVest email confirmation links.
- Role-based admin access by email through `admin_roles`.
- User dashboard with balances, active investments, profit tracking, deposits, withdrawals, referrals, notifications, KYC area, charts, and activity timeline.
- Admin dashboard with user management, deposit/withdrawal review, wallet address management, admin role assignment, analytics, announcements, logs, and exports.
- Crypto deposit flow: network selection, wallet display, proof upload, pending status, admin email notification, user approval/rejection email.
- Withdrawal flow with pending review, admin approval/rejection, email updates, and balance handling.
- Investment creation, reinvest-ready structure, countdown/progress tracking, completion cron route, and transaction logging.
- Supabase schema with RLS policies, helper functions, seed data, storage buckets, and realtime-ready tables.
- Professional HTML email templates for account confirmation, welcome, registration alert, deposit/withdrawal status, investments, password reset, and security alerts.

## 1. Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Configure Supabase

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy your Project URL, anon key, and service role key into `.env.local`.
5. Set `NEXT_PUBLIC_SITE_URL` to your real frontend URL. This URL is used inside the custom confirmation email.
6. Add your first admin email:

```sql
insert into public.admin_roles (email, role, active)
values ('your-email@example.com', 'admin', true)
on conflict (email) do update set active = true, role = 'admin';
```


## Custom email confirmation

NovaVest does not depend on Supabase's default confirmation email. Registration is handled by `/api/auth/register`, which:

1. Creates the user in Supabase Auth with `email_confirm: false`.
2. Creates a hashed verification token in `public.email_verification_tokens`.
3. Sends a branded NovaVest confirmation email through Resend or SMTP.
4. Confirms the user through `/api/auth/confirm-email?token=...`.
5. Updates `profiles.email_verified_at` after a successful confirmation.

If you already ran the old schema, run this migration once:

```sql
-- Supabase SQL Editor
-- Run file: supabase/migrations/custom-email-confirmation.sql
```

Recommended Supabase Auth setting:

- You may leave Supabase email confirmation ON. NovaVest uses the service role to confirm the user after they click your custom link.
- The login form also checks `profiles.email_verified_at`, so users cannot enter the dashboard without confirming through NovaVest.

## 3. Configure email

Use Resend:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM="NovaVest Capital <noreply@yourdomain.com>"
ADMIN_EMAIL=admin@yourdomain.com
```

Or SMTP:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

## 4. Cron job for matured investments

Call this endpoint every 5-15 minutes from Vercel Cron, Supabase Edge Scheduler, or any external cron provider:

```bash
curl -X POST https://yourdomain.com/api/cron/investments \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 5. Suggested deployment

- Frontend/API: Vercel or Render.
- Database/Auth/Storage: Supabase.
- Email: Resend or verified SMTP.
- Add `NEXT_PUBLIC_SITE_URL`, Supabase keys, email keys, and `CRON_SECRET` in your production environment.

## Folder structure

```txt
src/app                 App Router pages, layouts, route handlers
src/components          UI, landing, dashboard, admin components
src/hooks               React Query hooks
src/lib                 Supabase, auth, email, plans, validation utilities
src/stores              Zustand global UI state
supabase/schema.sql     Database schema, RLS policies, seed data
```

## Notes before real launch

- Replace all placeholder wallet addresses with your official custody/deposit addresses.
- Add identity verification and AML screening provider before accepting real funds.
- Add audit logging for every admin action.
- Use domain-authenticated email sending.
- Add a dedicated risk disclosure, terms, and privacy policy reviewed by counsel.
