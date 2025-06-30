# Southland Roofing Supabase Setup

This directory contains the database schema for the Southland Roofing application. Follow these instructions to set up your Supabase database.

## Database Setup Instructions

1. Log in to your [Supabase Dashboard](https://app.supabase.co/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `schema.sql` into the SQL editor
6. Run the query to create all tables, views, functions, and triggers

## Schema Overview

The database schema includes:

### Enums
- `user_role`: Administrator, User
- `team_member_status`: online, away, offline
- `project_status`: Estimate, Scheduled, In Progress, Completed

### Tables
- `users`: Stores user profiles with authentication links
- `projects`: Stores project information
- `team_members`: Stores team member information

### Views
- `active_team_members`: Shows only online or away team members

### Triggers
- Automatically creates user profiles when new auth users are created
- Updates last_active timestamp when team member status changes

## Important Notes

1. This schema does not include Row Level Security (RLS) policies as per client request
2. The `handle_new_user_signup` function automatically extracts user metadata including:
   - username
   - first_name
   - last_name
   - role

## Troubleshooting

If you encounter issues with user creation:

1. Check that the schema has been properly applied
2. Verify that the `auth.users` table exists and is accessible
3. Ensure the trigger `on_auth_user_created` is properly registered
4. Check that user metadata is being correctly passed during signup
