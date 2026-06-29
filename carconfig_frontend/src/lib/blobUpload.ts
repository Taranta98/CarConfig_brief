import { upload } from "@vercel/blob/client"

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

export async function uploadImageToBlob(file: File, prefix: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Immagine troppo grande (max 3 MB).")
  }

  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, "")
  const pathname = `${normalizedPrefix}/${file.name}`

  try {
    const blob = await upload(pathname, file, {
      access: "private",
      handleUploadUrl: "/api/blob/upload",
    })

    return blob.url
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("Upload Blob fallito.")
  }
}
