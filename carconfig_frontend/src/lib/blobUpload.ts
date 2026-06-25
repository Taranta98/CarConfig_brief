const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024

export async function uploadImageToBlob(file: File, prefix: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Immagine troppo grande (max 4.5 MB).")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("prefix", prefix)

  const uploadResponse = await fetch("/api/blob/upload", {
    method: "POST",
    body: formData,
  })

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text()
    let errorMessage = `Blob upload failed with status ${uploadResponse.status}`

    try {
      const errorData = JSON.parse(errorBody) as { error?: string }
      if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch {
      if (errorBody) {
        errorMessage = errorBody
      }
    }

    throw new Error(errorMessage)
  }

  const data = (await uploadResponse.json()) as { url?: string }

  if (!data.url) {
    throw new Error("Blob upload did not return a URL.")
  }

  return data.url
}
