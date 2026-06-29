import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { ensureBlobAuthAvailable, getBlobReadWriteToken } from "./blobAuth"

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

function isAllowedUploadPath(pathname: string): boolean {
  const normalized = pathname.replace(/^\/+/, "")
  return /^(vehicles|vehicle-colors)\//.test(normalized)
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    ensureBlobAuthAvailable()

    const body = request.body as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      token: getBlobReadWriteToken(),
      onBeforeGenerateToken: async (pathname) => {
        if (!isAllowedUploadPath(pathname)) {
          throw new Error("Upload path not allowed")
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
        }
      },
    })

    return response.status(200).json(jsonResponse)
  } catch (error) {
    console.error("Blob upload error:", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return response.status(400).json({ error: message })
  }
}
