import { http } from "@/lib/http"
import { isAxiosError } from "axios"
import type { SaveConfigurationPayload } from "./configuration.type"

async function readBlobErrorMessage(data: Blob): Promise<string | undefined> {
  try {
    const text = await data.text()
    const parsed = JSON.parse(text) as { message?: string }
    return parsed.message
  } catch {
    return undefined
  }
}

export function downloadPdfFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function fetchQuotePdf(
  payload: SaveConfigurationPayload
): Promise<Blob> {
  try {
    const response = await http.post<Blob>("/configurations/quote/pdf", payload, {
      responseType: "blob",
    })

    const contentType = response.headers["content-type"] ?? ""
    if (contentType.includes("application/json")) {
      const message = await readBlobErrorMessage(response.data)
      throw new Error(message ?? "Download PDF non riuscito")
    }

    return response.data
  } catch (error) {
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
      const message = await readBlobErrorMessage(error.response.data)
      throw new Error(message ?? "Download PDF non riuscito")
    }

    throw error
  }
}
