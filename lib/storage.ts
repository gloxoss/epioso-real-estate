import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Client-side client for uploads
export const supabaseClient = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BUCKET_NAME = 'documents'

export interface UploadOptions {
  organizationId: string
  entityType: string
  entityId: string
  filename: string
  mimeType: string
  size: number
}

export interface SignedUrlResponse {
  signedUrl: string
  storageKey: string
  uploadUrl: string
}

/**
 * Generate a unique storage key for a file
 */
export function generateStorageKey(options: UploadOptions): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = options.filename.split('.').pop() || ''
  
  return `${options.organizationId}/${options.entityType}/${options.entityId}/${timestamp}-${random}.${extension}`
}

/**
 * Generate a signed upload URL for client-side uploads
 */
export async function generateSignedUploadUrl(
  options: UploadOptions
): Promise<SignedUrlResponse> {
  const storageKey = generateStorageKey(options)
  
  // Generate signed URL for upload (expires in 1 hour)
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(storageKey, {
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to generate upload URL: ${error.message}`)
  }

  return {
    signedUrl: data.signedUrl,
    storageKey,
    uploadUrl: data.signedUrl,
  }
}

/**
 * Generate a signed download URL for private files
 */
export async function generateSignedDownloadUrl(
  storageKey: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storageKey, expiresIn)

  if (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a file from storage
 */
export async function deleteFile(storageKey: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([storageKey])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get file metadata from storage
 */
export async function getFileMetadata(storageKey: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(storageKey.split('/').slice(0, -1).join('/'), {
      search: storageKey.split('/').pop(),
    })

  if (error) {
    throw new Error(`Failed to get file metadata: ${error.message}`)
  }

  return data[0] || null
}

/**
 * Check if a file exists in storage
 */
export async function fileExists(storageKey: string): Promise<boolean> {
  try {
    const metadata = await getFileMetadata(storageKey)
    return !!metadata
  } catch {
    return false
  }
}

/**
 * Copy a file to a new location
 */
export async function copyFile(
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .copy(sourceKey, destinationKey)

  if (error) {
    throw new Error(`Failed to copy file: ${error.message}`)
  }
}

/**
 * Move a file to a new location
 */
export async function moveFile(
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .move(sourceKey, destinationKey)

  if (error) {
    throw new Error(`Failed to move file: ${error.message}`)
  }
}

/**
 * Get public URL for a file (if bucket is public)
 */
export function getPublicUrl(storageKey: string): string {
  const { data } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storageKey)

  return data.publicUrl
}

/**
 * Validate file type and size
 */
export function validateFile(
  mimeType: string,
  size: number,
  allowedTypes?: string[],
  maxSize?: number
): { valid: boolean; error?: string } {
  const defaultAllowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ]

  const defaultMaxSize = 50 * 1024 * 1024 // 50MB

  const types = allowedTypes || defaultAllowedTypes
  const maxFileSize = maxSize || defaultMaxSize

  if (!types.includes(mimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: ${types.join(', ')}`,
    }
  }

  if (size > maxFileSize) {
    return {
      valid: false,
      error: `File size ${Math.round(size / 1024 / 1024)}MB exceeds maximum allowed size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Extract image dimensions from file (if it's an image)
 */
export async function getImageDimensions(
  storageKey: string
): Promise<{ width: number; height: number } | null> {
  try {
    // This would require additional image processing library
    // For now, return null - can be implemented with sharp or similar
    return null
  } catch {
    return null
  }
}

/**
 * Generate thumbnail for images
 */
export async function generateThumbnail(
  storageKey: string,
  width: number = 200,
  height: number = 200
): Promise<string | null> {
  try {
    // This would require image processing
    // Can be implemented with Supabase Edge Functions or similar
    return null
  } catch {
    return null
  }
}
