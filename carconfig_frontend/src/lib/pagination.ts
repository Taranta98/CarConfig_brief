export const DEFAULT_PAGE_SIZE = 10

export type PaginationMetadata = {
  page: number
  totalPages: number
  totalItems: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

/** Alias per risposte API paginate future. */
export type PaginatedResponse<T> = PaginationMetadata & {
  data: T[]
}

export function getPaginationMetadata(
  totalItems: number,
  page: number,
  pageSize: number
): PaginationMetadata {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const clampedPage = Math.min(Math.max(1, page), totalPages)

  return {
    page: clampedPage,
    totalPages,
    totalItems,
    hasPrevPage: clampedPage > 1,
    hasNextPage: clampedPage < totalPages,
  }
}

export function paginateSlice<T>(
  items: T[],
  page: number,
  pageSize: number
): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}
