import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleUpload } from "@vercel/blob/client"

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" })
  }

  const body = request.body

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // No-op: backend persistence happens in Laravel after receiving the URL.
      },
    })

    return response.status(200).json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return response.status(400).json({ error: message })
  }
}

