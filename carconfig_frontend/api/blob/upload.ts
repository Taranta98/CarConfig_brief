import type { VercelRequest, VercelResponse } from "@vercel/node"
import { put } from "@vercel/blob"
import Busboy from "busboy"

export const config = {
  api: {
    bodyParser: false,
  },
}

type ParsedUpload = {
  prefix: string
  filename: string
  contentType: string
  buffer: Buffer
}

function parseMultipart(request: VercelRequest): Promise<ParsedUpload> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: request.headers })
    let prefix = ""
    let filename = "image"
    let contentType = "application/octet-stream"
    const chunks: Buffer[] = []

    busboy.on("field", (name, value) => {
      if (name === "prefix") {
        prefix = value
      }
    })

    busboy.on("file", (_name, file, info) => {
      filename = info.filename || "image"
      contentType = info.mimeType || "application/octet-stream"

      file.on("data", (chunk: Buffer) => {
        chunks.push(chunk)
      })
    })

    busboy.on("error", reject)

    busboy.on("finish", () => {
      if (!prefix.trim()) {
        reject(new Error("Missing prefix"))
        return
      }

      const buffer = Buffer.concat(chunks)

      if (buffer.length === 0) {
        reject(new Error("Empty file"))
        return
      }

      resolve({
        prefix,
        filename,
        contentType,
        buffer,
      })
    })

    request.pipe(busboy)
  })
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return response.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN" })
  }

  try {
    const { prefix, filename, contentType, buffer } = await parseMultipart(request)
    const safeName = filename.trim() || "image"
    const pathname = `${prefix.replace(/^\/+|\/+$/g, "")}/${safeName}`

    const blob = await put(pathname, buffer, {
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
