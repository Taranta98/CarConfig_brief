import type { PaginationMetadata } from "@/lib/pagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "./ui/pagination"

type PaginatorProps = {
  metadata: PaginationMetadata
  onPageChange: (page: number) => void
}

function Paginator({ metadata, onPageChange }: PaginatorProps) {
  const { page: activePage, totalPages, hasPrevPage, hasNextPage } = metadata

  if (totalPages <= 1) {
    return null
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Precedente"
            className={!hasPrevPage ? "pointer-events-none opacity-50" : undefined}
            onClick={hasPrevPage ? () => onPageChange(activePage - 1) : undefined}
          />
        </PaginationItem>

        {activePage >= 3 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
          </PaginationItem>
        )}

        {activePage >= 4 && totalPages > 4 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {activePage === totalPages && totalPages >= 4 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(activePage - 2)}>
              {activePage - 2}
            </PaginationLink>
          </PaginationItem>
        )}

        {activePage > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(activePage - 1)}>
              {activePage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationLink isActive>{activePage}</PaginationLink>
        </PaginationItem>

        {activePage < totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(activePage + 1)}>
              {activePage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {activePage === 1 && totalPages >= 3 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(activePage + 2)}>
              {activePage + 2}
            </PaginationLink>
          </PaginationItem>
        )}

        {totalPages > 4 && activePage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {totalPages >= 4 && activePage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            text="Successiva"
            className={!hasNextPage ? "pointer-events-none opacity-50" : undefined}
            onClick={hasNextPage ? () => onPageChange(activePage + 1) : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default Paginator
