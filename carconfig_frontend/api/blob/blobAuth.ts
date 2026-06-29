export function getBlobReadWriteToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()

  if (token) {
    return token
  }

  throw new Error(
    "Connect a Blob store to this Vercel project (Storage tab) or set BLOB_READ_WRITE_TOKEN."
  )
}

export function blobAuthOptions(): { token?: string } {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  const storeId = process.env.BLOB_STORE_ID

  if (storeId) {
    return {}
  }

  if (token) {
    return { token }
  }

  throw new Error(
    "Connect a Blob store to this Vercel project or set BLOB_READ_WRITE_TOKEN."
  )
}

export function ensureBlobAuthAvailable(): void {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  const storeId = process.env.BLOB_STORE_ID

  if (!storeId && !token) {
    throw new Error(
      "Connect a Blob store to this Vercel project (Storage tab) or set BLOB_READ_WRITE_TOKEN."
    )
  }
}
