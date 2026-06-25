import { upload } from "@vercel/blob/client"

export async function uploadImageToBlob(file: File, prefix: string): Promise<string> {
  const safeName = file.name?.trim() ? file.name.trim() : "image"
  const pathname = `${prefix.replace(/^\/+|\/+$/g, "")}/${safeName}`

  const blob = await upload(pathname, file, {
    access: "private",
    handleUploadUrl: "/api/blob/upload",
  })

  return blob.url
}

