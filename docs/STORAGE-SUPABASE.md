# Supabase Storage Integration (pet images)

The storage pattern follows the implementation at `~/tmp/puzzles/pronai-web-app`.

## Setup

1. Install: `pnpm --filter web add @supabase/supabase-js`
2. Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Bucket: `bethehero-pet-images`
4. Image path: `pets/{petId}/{filename}`

## Create `lib/storage/supabase.ts`

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const PET_IMAGES_BUCKET = 'bethehero-pet-images'

export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase env')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

export async function uploadPetImage(petId: string, file: Buffer | Blob, filename: string, contentType: string) {
  const supabase = getSupabaseAdmin()
  const path = `pets/${petId}/${filename}`
  const { data, error } = await supabase.storage.from(PET_IMAGES_BUCKET).upload(path, file, {
    contentType,
    upsert: true,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data: signed } = await supabase.storage.from(PET_IMAGES_BUCKET).createSignedUrl(path, 3600)
  return { path, url: signed?.signedUrl ?? '' }
}
```

## Add image flow

1. Client uploads to Supabase Storage (SDK or signed upload URL)
2. Client calls `POST /api/pets/:id/images` with `{ url, storagePath, position, isCover }`
3. `storagePath` must follow `pets/{petId}/...`
