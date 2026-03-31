# Blog Post Stats Setup

This blog uses Supabase directly from the browser for post view counts.

## 1. Add local environment variables

Copy `.env.example` to `.env.local` and fill in your project values:

```bash
cp .env.example .env.local
```

```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key
```

## 2. Run the SQL in Supabase

Open the Supabase SQL editor and run:

- `supabase/post-stats.sql`

That script creates:

- `post_stats`
- `post_view_events`
- `record_post_view(...)`

## 3. Start the site

```bash
npm run dev
```

Post pages will:

- record one view per browser per day
- show live view counts beneath the publish date

The blog index will:

- fetch view counts for all visible posts
- display the count beside each post date
