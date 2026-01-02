# Create Storage Bucket for File Uploads - Quick Guide

## The Error You're Seeing

```
Storage bucket not configured
```

This means the "messages" storage bucket doesn't exist in Supabase yet.

## Fix: Create the Storage Bucket (2 minutes)

### Step 1: Go to Supabase Storage

1. Open https://supabase.com/dashboard
2. Select your project
3. Click **"Storage"** in the left sidebar (bucket icon 🪣)

### Step 2: Create New Bucket

1. Click **"New bucket"** button (top right)
2. Fill in the form:
   ```
   Name: messages
   Public bucket: ✓ ON (checked)
   ```
3. Click **"Create bucket"**

### Step 3: Set Storage Policies

After creating the bucket, you need to set up access policies:

1. Click on the **"messages"** bucket you just created
2. Click **"Policies"** tab
3. Click **"New policy"**

#### Policy 1: Allow Uploads (INSERT)

```
Policy name: Allow authenticated uploads
Allowed operation: INSERT
Target roles: authenticated

SQL Policy:
```

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');
```

Click **"Review"** → **"Save policy"**

#### Policy 2: Allow Public Downloads (SELECT)

```
Policy name: Allow public downloads
Allowed operation: SELECT
Target roles: public

SQL Policy:
```

```sql
-- Allow anyone to download files
CREATE POLICY "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'messages');
```

Click **"Review"** → **"Save policy"**

#### Policy 3: Allow Authenticated Delete (Optional)

```sql
-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'messages');
```

### Step 4: Alternative - Create Everything via SQL

If you prefer SQL, go to **SQL Editor** and run:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages', 'messages', true);

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');

-- Allow public to download
CREATE POLICY "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'messages');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'messages');
```

### Step 5: Verify It Works

1. **Refresh your admin chat page**
2. **Click the paperclip icon** to upload a file
3. **Select a file** (image, PDF, etc.)
4. **Watch for success message**: "File uploaded successfully"
5. **Send the message** with the attachment

If you see the success toast and the file preview → **It works!** 🎉

## Troubleshooting

### Error: "Bucket already exists"

If you see this error, the bucket exists but policies might be missing.

**Fix:** Add the policies manually:

1. Go to Storage → messages bucket
2. Click Policies tab
3. Add the policies from Step 3 above

### Error: "Row level security policy violation"

The policies are missing or incorrect.

**Fix:** Run the policy SQL from Step 4

### Files upload but can't be viewed

The bucket isn't public.

**Fix:**
1. Storage → messages bucket → Configuration
2. Toggle **"Public bucket"** to ON
3. Save

## Quick Verification SQL

Run this to check everything is set up:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'messages';

-- Check policies exist
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

**Expected output:**
- Bucket `messages` with `public = true`
- At least 2 policies (INSERT for authenticated, SELECT for public)

## What's Next?

After setting up the bucket:

1. ✅ Storage bucket created and public
2. ✅ Policies configured
3. ✅ File uploads will work
4. ✅ Files will be accessible via public URL

Now you can upload images, PDFs, documents in the chat!
