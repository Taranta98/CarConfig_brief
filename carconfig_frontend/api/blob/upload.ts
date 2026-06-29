import type { VercelRequest, VercelResponse } from "@vercel/node"
import { put } from "@vercel/blob"
import { blobAuthOptions, ensureBlobAuthAvailable } from "./blobAuth"

type UploadBody = {
  prefix?: string
  filename?: string
  contentType?: string
  data?: string
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    if (request.method !== "POST") {
      return response.status(405).json({ error: "Method Not Allowed" })
    }

    ensureBlobAuthAvailable()

    const body = (request.body ?? {}) as UploadBody
    const prefix = typeof body.prefix === "string" ? body.prefix : ""
    const filename = typeof body.filename === "string" ? body.filename : "image"
    const contentType =
      typeof body.contentType === "string" ? body.contentType : "application/octet-stream"
    const data = typeof body.data === "string" ? body.data : ""

    if (!prefix.trim() || !data) {
      return response.status(400).json({ error: "Missing prefix or data" })
    }

    const buffer = Buffer.from(data, "base64")

    if (buffer.length === 0) {
      return response.status(400).json({ error: "Empty file" })
    }

    const safeName = filename.trim() || "image"
    const pathname = `${prefix.replace(/^\/+|\/+$/g, "")}/${safeName}`

    const blob = await put(pathname, buffer, {
      access: "private",
      ...blobAuthOptions(),
      contentType,
      addRandomSuffix: true,
    })

    return response.status(200).json({ url: blob.url })
  } catch (error) {
    console.error("Blob upload error:", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return response.status(400).json({ error: message })
  }
}
