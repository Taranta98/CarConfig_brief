export type FormDataValue =
  | string
  | number
  | boolean
  | File
  | null
  | undefined
  | Record<string, FormDataValue>

function appendValue(
  formData: FormData,
  key: string,
  value: FormDataValue
): void {
  if (value === undefined || value === null) {
    return
  }

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  if (typeof value === "boolean") {
    formData.append(key, value ? "1" : "0")
    return
  }

  if (typeof value === "object") {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      appendValue(formData, `${key}[${nestedKey}]`, nestedValue)
    }
    return
  }

  formData.append(key, String(value))
}

export function hasFileValues(data: Record<string, FormDataValue>): boolean {
  for (const value of Object.values(data)) {
    if (value instanceof File) {
      return true
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (hasFileValues(value as Record<string, FormDataValue>)) {
        return true
      }
    }
  }

  return false
}

export function buildFormData(
  data: Record<string, FormDataValue>,
  method?: "PUT" | "PATCH"
): FormData {
  const formData = new FormData()

  if (method) {
    formData.append("_method", method)
  }

  for (const [key, value] of Object.entries(data)) {
    appendValue(formData, key, value)
  }

  return formData
}
