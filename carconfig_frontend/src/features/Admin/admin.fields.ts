export type AdminFieldType =
  | "text"
  | "number"
  | "textarea"
  | "password"
  | "checkbox"
  | "select"
  | "color"
  | "image"

export type AdminFieldOption = {
  value: string
  label: string
}

export type AdminField = {
  name: string
  label: string
  type: AdminFieldType
  required?: boolean
  placeholder?: string
  options?: AdminFieldOption[]
  /** Mostrato solo in creazione */
  createOnly?: boolean
  /** Nascosto in creazione */
  hideOnCreate?: boolean
  /** Nascosto in modifica */
  hideOnEdit?: boolean
}
