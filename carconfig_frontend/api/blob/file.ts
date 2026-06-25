import type { VercelRequest, VercelResponse } from "@vercel/node"
import { get } from "@vercel/blob"
import { Readable } from "node:stream"

function isPrivateBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.endsWith(".private.blob.vercel-storage.com")
  } catch {
    return false
  }
}

function extractPathnameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.replace(/^\/+/, "")
    return pathname ? pathname : null
  } catch {
    return null
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method Not Allowed" })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return response.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN" })
  }

  const urlParam = typeof request.query.url === "string" ? request.query.url : null
  const pathnameParam =
    typeof request.query.pathname === "string" ? request.query.pathname : null

  const pathname =
    pathnameParam?.replace(/^\/+/, "") ??
    (urlParam && isPrivateBlobUrl(urlParam) ? extractPathnameFromUrl(urlParam) : null)

  if (!pathname) {
    return response.status(400).json({ error: "Missing pathname" })
  }

  const result = await get(pathname, { access: "private", token })

  if (!result || result.statusCode !== 200) {
    return response.status(404).send("Not found")
  }

  response.setHeader("Content-Type", result.blob.contentType ?? "application/octet-stream")
  response.setHeader("X-Content-Type-Options", "nosniff")
  response.setHeader("Cache-Control", "public, max-age=31536000, immutable")
  response.setHeader("ETag", result.blob.etag)

  Readable.fromWeb(result.stream as unknown as ReadableStream).pipe(response)
}
