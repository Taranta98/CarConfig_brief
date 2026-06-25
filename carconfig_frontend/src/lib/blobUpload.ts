const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024

export async function uploadImageToBlob(file: File, prefix: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Immagine troppo grande (max 4.5 MB).")
  }

  const safeName = file.name?.trim() ? file.name.trim() : "image"
  const pathname = `${prefix.replace(/^\/+|\/+$/g, "")}/${safeName}`

  const uploadResponse = await fetch(
    `/api/blob/upload?pathname=${encodeURIComponent(pathname)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    }
  )

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text()
    throw new Error(
      errorBody || `Blob upload failed with status ${uploadResponse.status}`
    )
  }

  const data = (await uploadResponse.json()) as { url?: string }

  if (!data.url) {
    throw new Error("Blob upload did not return a URL.")
  }

  return data.url
}
