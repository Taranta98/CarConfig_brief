import type { VercelRequest, VercelResponse } from "@vercel/node"
import { put } from "@vercel/blob"

export const config = {
  api: {
    bodyParser: false,
  },
}

function readBody(request: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    request.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk))
    })
    request.on("end", () => {
      resolve(Buffer.concat(chunks))
    })
    request.on("error", reject)
  })
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "PUT") {
    return response.status(405).json({ error: "Method Not Allowed" })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return response.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN" })
  }

  const pathname =
    typeof request.query.pathname === "string" ? request.query.pathname : null

  if (!pathname || pathname.trim() === "") {
    return response.status(400).json({ error: "Missing pathname" })
  }

  try {
    const body = await readBody(request)
    const contentType =
      typeof request.headers["content-type"] === "string"
        ? request.headers["content-type"]
        : "application/octet-stream"

    const blob = await put(pathname, body, {
      access: "private",
      token,
      contentType,
      addRandomSuffix: true,
    })

    return response.status(200).json({ url: blob.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return response.status(400).json({ error: message })
  }
}
