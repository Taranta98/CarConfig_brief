import type { VercelRequest, VercelResponse } from "@vercel/node"
import { get } from "@vercel/blob"
import { blobAuthOptions, ensureBlobAuthAvailable } from "./blobAuth"

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
  try {
    if (request.method !== "GET") {
      return response.status(405).json({ error: "Method Not Allowed" })
    }

    ensureBlobAuthAvailable()

    const urlParam = typeof request.query.url === "string" ? request.query.url : null
    const pathnameParam =
      typeof request.query.pathname === "string" ? request.query.pathname : null

    const pathname =
      pathnameParam?.replace(/^\/+/, "") ??
      (urlParam && isPrivateBlobUrl(urlParam) ? extractPathnameFromUrl(urlParam) : null)

    if (!pathname) {
      return response.status(400).json({ error: "Missing pathname" })
    }

    const result = await get(pathname, { access: "private", ...blobAuthOptions() })

    if (!result || result.statusCode !== 200 || !result.stream) {
      return response.status(404).send("Not found")
    }

    const arrayBuffer = await new Response(result.stream).arrayBuffer()

    response.setHeader("Content-Type", result.blob.contentType ?? "application/octet-stream")
    response.setHeader("X-Content-Type-Options", "nosniff")
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable")
    response.setHeader("ETag", result.blob.etag)

    return response.status(200).send(Buffer.from(arrayBuffer))
  } catch (error) {
    console.error("Blob file proxy error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return response.status(500).json({ error: message })
  }
}
