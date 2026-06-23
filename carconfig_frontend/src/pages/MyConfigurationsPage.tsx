import { ConfigurationListCard } from "@/features/Configurations/components/ConfigurationListCard"
import { ConfigurationService } from "@/features/Configurations/configuration.service"
import {
  savedConfigurationToPayload,
  type SavedConfiguration,
} from "@/features/Configurations/configuration.type"
import { downloadPdfFile, fetchQuotePdf } from "@/features/Configurations/quotePdf"
import { useAuthStore } from "@/features/Auth/auth.store"
import Paginator from "@/components/Paginator"
import { Button } from "@/components/ui/button"
import { useClientPagination } from "@/hooks/useClientPagination"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { useState } from "react"
import { toast } from "sonner"

const CONFIGURATIONS_PAGE_SIZE = 9

const MyConfigurationsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)
  const { data: configurationsResponse, isLoading, isError } = useQuery({
    queryKey: ["configurations"],
    queryFn: () => ConfigurationService.list(),
    enabled: Boolean(token),
  })
  const configurations = configurationsResponse?.data.data ?? []
  const { metadata, paginatedItems, setPage } = useClientPagination(
    configurations,
    CONFIGURATIONS_PAGE_SIZE
  )

  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ConfigurationService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["configurations"] })
      toast.success("Configurazione eliminata")
    },
    onError: () => {
      toast.error("Impossibile eliminare la configurazione")
    },
  })

  const downloadMutation = useMutation({
    mutationFn: fetchQuotePdf,
  })

  const handleDownload = async (config: SavedConfiguration) => {
    const payload = savedConfigurationToPayload(config)
    if (!payload) {
      toast.error("Impossibile generare il PDF per questa configurazione")
      return
    }

    const filename = `preventivo-${config.vehicle.brand}-${config.vehicle.model}.pdf`
      .replace(/\s+/g, "-")
      .toLowerCase()

    setDownloadingId(config.id)
    try {
      const blob = await downloadMutation.mutateAsync(payload)
      downloadPdfFile(blob, filename)
      toast.success("PDF scaricato")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Download PDF non riuscito"
      )
    } finally {
      setDownloadingId(null)
    }
  }

  if (!token) {
    return (
      <main className="w-full px-4 pt-17.5 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Area personale
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
            Le mie configurazioni
          </h1>
          <p className="mt-4 text-muted-foreground">
            Accedi per vedere le configurazioni salvate.
          </p>
          <Button className="mt-8" onClick={() => navigate("/auth/login")}>
            Accedi
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full px-4 pt-17.5 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Area personale
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Le mie configurazioni
          </h1>
        </div>

        {isLoading && (
          <p className="mt-16 text-center text-muted-foreground">
            Caricamento…
          </p>
        )}

        {isError && (
          <p className="mt-16 text-center text-destructive">
            Impossibile caricare le configurazioni.
          </p>
        )}

        {!isLoading && !isError && configurations.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">
            Nessuna configurazione salvata.
          </p>
        )}

        {configurations.length > 0 && (
          <>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((config) => (
                <li key={config.id}>
                  <ConfigurationListCard
                    config={config}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onDownload={handleDownload}
                    isDeleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === config.id
                    }
                    isDownloading={downloadingId === config.id}
                    canDownload={Boolean(config.trim)}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-10 flex justify-center">
              <Paginator metadata={metadata} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default MyConfigurationsPage
