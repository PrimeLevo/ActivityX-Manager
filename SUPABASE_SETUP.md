# Supabase Setup Instructions

## 1. Get Your Supabase Credentials

1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon public key

## 2. Update Configuration

Edit `supabase-config.js` and replace:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

With your actual values:

```javascript
const supabaseUrl = 'https://your-project-ref.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## 3. Database Tables

Make sure you have created these tables in Supabase:

### law_firms
```sql
CREATE TABLE law_firms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_profiles
```sql
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    law_firm_id UUID REFERENCES law_firms(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. RLS Policies

Apply the RLS policies from the SQL commands provided earlier.

## 5. Test Authentication

After setup:
1. Try signing up a new user
2. Check that the user appears in:
   - Authentication > Users
   - Database > user_profiles table
3. Manually set `is_active = true` and assign a `law_firm_id` for testing login

## 6. Admin Workflow

For each new user signup:
1. User appears in user_profiles with `is_active = false`
2. Admin manually sets `is_active = true`
3. Admin assigns appropriate `law_firm_id`
4. User can then successfully log in