# Southland Roofing Database Setup

This guide will help you set up the Supabase database for the Southland Roofing application with support for first and last name fields.

## Database Error Fix

The error "Database error saving new user" occurs because we're trying to insert user records with first_name and last_name fields, but these columns don't exist in the database yet.

## Setup Instructions

1. **Log in to your Supabase Dashboard**
   - Go to [https://app.supabase.co/](https://app.supabase.co/)
   - Select your project

2. **Run the Database Schema SQL**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Create a new query
   - Copy and paste the contents of `supabase/schema.sql` into the editor
   - Run the query to create all tables, views, functions, and triggers

3. **Verify Database Structure**
   - Go to the "Table Editor" in your Supabase dashboard
   - Check that the `users` table has the following columns:
     - id (UUID)
     - created_at (timestamp)
     - email (text)
     - username (text)
     - first_name (text)
     - last_name (text)
     - role (user_role)
     - avatar_url (text)
     - last_sign_in (timestamp)

4. **Test User Registration**
   - After applying the schema, try registering a new user with first and last name
   - The database trigger will automatically create the user profile

## Troubleshooting

If you still encounter issues:

1. **Check for Existing Tables**
   - If tables already exist, you may need to alter them to add the new columns:
   ```sql
   ALTER TABLE users 
   ADD COLUMN first_name TEXT,
   ADD COLUMN last_name TEXT;
   ```

2. **Check Trigger Function**
   - Ensure the `handle_new_user_signup` function is correctly created and the trigger is active
   - You can verify this in the "Database Functions" section of your Supabase dashboard

3. **Manual User Creation**
   - If the trigger isn't working, you can manually create user profiles after registration:
   ```sql
   INSERT INTO users (id, email, username, first_name, last_name, role, created_at)
   VALUES ('user-id', 'email', 'username', 'first-name', 'last-name', 'User', NOW());
   ```

## Application Changes

The application has been updated to:

1. Include first and last name fields in the registration form
2. Store these fields in Supabase Auth metadata
3. Display and allow editing of these fields in the user settings
4. Validate these fields during form submission

Once the database schema is updated, the application will work correctly with the new fields.
