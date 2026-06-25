import { get } from "@vercel/blob"

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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return Response.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 })
  }

  const requestUrl = new URL(request.url)
  const urlParam = requestUrl.searchParams.get("url")
  const pathnameParam = requestUrl.searchParams.get("pathname")

  const pathname =
    pathnameParam?.replace(/^\/+/, "") ??
    (urlParam && isPrivateBlobUrl(urlParam) ? extractPathnameFromUrl(urlParam) : null)

  if (!pathname) {
    return Response.json({ error: "Missing pathname" }, { status: 400 })
  }

  const result = await get(pathname, { access: "private", token })

  if (!result || result.statusCode !== 200) {
    return new Response("Not found", { status: 404 })
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: result.blob.etag,
    },
  })
}
