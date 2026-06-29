export function blobAuthOptions(): { token?: string } {
  const isVercel = Boolean(process.env.VERCEL)
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()

  // On Vercel, prefer OIDC from a connected Blob store. A stale manual token
  // overrides OIDC and causes "Access denied" even when the store is linked.
  if (isVercel) {
    return {}
  }

  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN")
  }

  return { token }
}

export function ensureBlobAuthAvailable(): void {
  const isVercel = Boolean(process.env.VERCEL)
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  const storeId = process.env.BLOB_STORE_ID

  if (isVercel) {
    if (!storeId && !token) {
      throw new Error(
        "Connect a Blob store to this Vercel project (Storage tab) or set a valid BLOB_READ_WRITE_TOKEN."
      )
    }

    return
  }

  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN")
  }
}
