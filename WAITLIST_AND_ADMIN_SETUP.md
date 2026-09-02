# Waitlist & Admin Portal Setup Guide

This document explains how to set up and configure the new waitlist and admin portal system for customer acquisition and management.

## Overview

The system consists of three main components:

1. **Waitlist System** - Public signup page for customers to join the custom AI waitlist
2. **Admin Portal** - Dashboard for managing customers and communications
3. **Supabase Backend** - Database for storing subscriber and customer data

## Prerequisites

- A Supabase account ([supabase.com](https://supabase.com))
- Node.js 18+ (already installed)

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name (e.g., "portfolio-admin")
3. Set a strong database password and save it
4. Choose your region (closest to your users)
5. Wait for the project to initialize

## Step 2: Create Database Tables

In your Supabase project, go to the SQL Editor and run the following SQL to create the required tables:

```sql
-- Waitlist subscribers table
CREATE TABLE waitlist_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  offering text DEFAULT 'general',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_waitlist_email ON waitlist_subscribers(email);
CREATE INDEX idx_waitlist_status ON waitlist_subscribers(status);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'prospect', 'engaged', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);

-- Communications table (for tracking emails/messages sent to customers)
CREATE TABLE communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text,
  type text DEFAULT 'email' CHECK (type IN ('email', 'sms', 'note')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_communications_customer ON communications(customer_id);

-- Admin users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_admin_email ON admin_users(email);
```

## Step 3: Create Admin User(s)

To create admin accounts, you'll need to hash the password. Run this in Node.js:

```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

hashPassword('your-secure-password').then(hash => {
  console.log('Hashed password:', hash);
  console.log('\nCopy this hash and insert into admin_users table');
});
```

Then in Supabase SQL Editor, insert the admin user:

```sql
INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@yoursite.com', 'YOUR_HASHED_PASSWORD', 'admin');
```

## Step 4: Get Supabase Credentials

1. Go to your Supabase project settings
2. Click "API" in the left sidebar
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 5: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_JWT_SECRET=your-super-secret-random-string-min-32-chars
```

### Generating a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Configure Supabase Row Level Security (RLS)

For security, enable Row Level Security on your tables. In Supabase, go to the table and click "Authentication" to set up policies. For now, the basic setup allows:

- Public access to insert into `waitlist_subscribers`
- Authenticated access to read/write `customers` and `communications`

## Step 7: Enable Supabase Auth (Optional)

If you want to add authentication beyond the JWT system:

1. Go to Authentication → Settings in Supabase
2. Enable Email provider
3. Configure email templates as needed

## Using the System

### Public Waitlist Signup

Users can sign up for the custom AI waitlist at:
```
https://yoursite.com/waitlist
```

The form captures:
- Name
- Email
- Offering type (defaults to "custom-ai")

### Admin Portal

Access the admin dashboard at:
```
https://yoursite.com/admin
```

Login with:
- Email: (the admin email you created)
- Password: (the password you set)

Once logged in, you'll see:
- **Dashboard** with statistics (waitlist count, customer count, communications sent)
- **Customer list** with status tracking
- **Recent customers** table

### API Endpoints

The system exposes these API endpoints:

#### Waitlist
- `POST /api/waitlist` - Add person to waitlist
  - Body: `{ email, name, offering }`

#### Admin
- `POST /api/admin/login` - Authenticate admin
  - Body: `{ email, password }`
  - Returns: `{ token, admin }`

- `GET /api/admin/stats` - Get dashboard statistics
  - Headers: `Authorization: Bearer TOKEN`
  - Returns: `{ stats: { waitlistCount, customerCount, communicationCount } }`

- `GET /api/admin/customers` - List all customers
  - Headers: `Authorization: Bearer TOKEN`
  - Returns: `{ customers: [...] }`

- `POST /api/admin/customers` - Create new customer
  - Headers: `Authorization: Bearer TOKEN`
  - Body: `{ email, name, status }`

## Next Steps

### Email Integration

To send automated emails to waitlist members and customers, you'll want to integrate an email service like:
- SendGrid
- Mailgun
- Resend
- AWS SES

Add these to your environment variables and create new API routes for sending communications.

### Communication Layer

Currently, the system stores communications but doesn't send them automatically. To implement the communication layer:

1. Create a `POST /api/admin/communications/send` endpoint
2. Add email sending logic using your chosen provider
3. Create a admin UI for composing and sending bulk emails

### Analytics

Track what's working by monitoring:
- Signup conversion rates
- Admin login frequency
- Customer engagement levels

### Scaling

For larger volumes, consider:
- Adding email queue/background jobs (Bull, RQ, etc.)
- Implementing webhook-based integrations
- Adding customer segments and tagging
- Building email campaign templates

## Troubleshooting

### "Missing Supabase environment variables"

Make sure `.env.local` exists and has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### "Invalid credentials" at login

Verify that:
1. The admin user exists in the database
2. You're using the correct password (must be hashed with bcrypt)
3. `ADMIN_JWT_SECRET` is set in `.env.local`

### Signup not working

Check:
1. Supabase anon key has insert permissions on `waitlist_subscribers`
2. Network connectivity to Supabase
3. Browser console for specific error messages

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` (it's in .gitignore)
- The `SUPABASE_SERVICE_ROLE_KEY` is secret - treat it like a password
- The `ADMIN_JWT_SECRET` should be at least 32 characters
- Consider adding rate limiting to the `/api/waitlist` endpoint
- Implement CAPTCHA for the waitlist form before production
- Set up proper email verification for admin accounts

## Support

For Supabase-specific issues, visit [supabase.com/docs](https://supabase.com/docs).
