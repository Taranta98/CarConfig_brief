import {
  DEFAULT_PAGE_SIZE,
  getPaginationMetadata,
  paginateSlice,
  type PaginationMetadata,
} from "@/lib/pagination"
import { useEffect, useState } from "react"

export function useClientPagination<T>(
  items: T[],
  pageSize: number = DEFAULT_PAGE_SIZE
) {
  const [page, setPage] = useState(1)

  const metadata = getPaginationMetadata(items.length, page, pageSize)
  const paginatedItems = paginateSlice(items, metadata.page, pageSize)

  useEffect(() => {
    if (page !== metadata.page) {
      setPage(metadata.page)
    }
  }, [metadata.page, page])

  return {
    page: metadata.page,
    setPage,
    metadata,
    paginatedItems,
  }
}

export type { PaginationMetadata }
