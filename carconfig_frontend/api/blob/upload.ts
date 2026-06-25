import { put } from "@vercel/blob"

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return Response.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const prefix = formData.get("prefix")

    if (!(file instanceof File)) {
      return Response.json({ error: "Missing file" }, { status: 400 })
    }

    if (typeof prefix !== "string" || prefix.trim() === "") {
      return Response.json({ error: "Missing prefix" }, { status: 400 })
    }

    if (file.size === 0) {
      return Response.json({ error: "Empty file" }, { status: 400 })
    }

    const safeName = file.name?.trim() ? file.name.trim() : "image"
    const pathname = `${prefix.replace(/^\/+|\/+$/g, "")}/${safeName}`

    const blob = await put(pathname, file, {
      access: "private",
      token,
      addRandomSuffix: true,
    })

    return Response.json({ url: blob.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return Response.json({ error: message }, { status: 400 })
  }
}
