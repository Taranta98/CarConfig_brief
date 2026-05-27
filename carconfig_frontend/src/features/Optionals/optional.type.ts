export type OptionalCategory = "Comfort" | "Technology" | "Safety" | "Exterior"

export const optionalCategories: OptionalCategory[] = [
  "Comfort",
  "Technology",
  "Safety",
  "Exterior",
]

export type Optional = {
  id: number
  name: string
  description: string
  price: number
  category: OptionalCategory | string
  is_required: boolean
  vehicle_id: number
  image?: string | null
}
