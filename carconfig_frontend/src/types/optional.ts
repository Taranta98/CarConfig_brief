export type OptionalCategory = 'Comfort' | 'Technology' | 'Safety' | 'Exterior'

export type Optional = {
  id: number
  name: string
  description: string
  price: number
  category: OptionalCategory
  is_required: boolean
  vehicle_id: number
}
