# Supabase Storage Setup Guide

## Automatic Setup

Run the storage bucket setup script:

\`\`\`bash
npx ts-node scripts/04-setup-storage-bucket.ts
\`\`\`

This script will:
- Create the "photos" storage bucket if it doesn't exist
- Set the bucket to public access
- Configure the 25MB file size limit

## Manual Setup (Alternative)

If you prefer to set up the bucket manually:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **Create a new bucket**
4. Name it: `photos`
5. Make it **Public** (toggle the public access switch)
6. Click **Create bucket**

## Verify Setup

After setup, you should be able to:
- Upload photos through the app
- See photos appear in the Supabase Storage dashboard under the "photos" bucket
- Access photos via their public URLs

## Troubleshooting

If you still get "Bucket not found" errors:
1. Verify the bucket name is exactly "photos" (case-sensitive)
2. Check that the bucket is set to public access
3. Ensure your Supabase environment variables are correctly set
4. Try refreshing the page and uploading again
