const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read file"))
        return
      }

      const base64 = reader.result.split(",")[1]

      if (!base64) {
        reject(new Error("Failed to encode file"))
        return
      }

      resolve(base64)
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

export async function uploadImageToBlob(file: File, prefix: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Immagine troppo grande (max 3 MB).")
  }

  const data = await fileToBase64(file)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  let uploadResponse: Response

  try {
    uploadResponse = await fetch("/api/blob/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        data,
      }),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Upload Blob scaduto: la function Vercel non ha risposto.")
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }

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

  const payload = (await uploadResponse.json()) as { url?: string }

  if (!payload.url) {
    throw new Error("Blob upload did not return a URL.")
  }

  return payload.url
}
