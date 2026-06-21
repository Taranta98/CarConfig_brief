import { ConfigurationListCard } from "@/features/Configurations/components/ConfigurationListCard"
import { ConfigurationService } from "@/features/Configurations/configuration.service"
import {
  savedConfigurationToPayload,
  type SavedConfiguration,
} from "@/features/Configurations/configuration.type"
import { downloadPdfFile, fetchQuotePdf } from "@/features/Configurations/quotePdf"
import { useAuthStore } from "@/features/Auth/auth.store"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Info } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useState } from "react"
import { toast } from "sonner"

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
      <main className="w-full px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Le tue configurazioni
        </h1>
        <p className="mt-4 text-muted-foreground">
          Accedi per vedere le configurazioni salvate.
        </p>
        <Button className="mt-6" onClick={() => navigate("/auth/login")}>
          Accedi
        </Button>
      </main>
    )
  }

  return (
    <main className="w-full px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Le tue configurazioni
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tutte le configurazioni che hai salvato dal configuratore.
          </p>
        </div>
        <Button render={<Link to="/configuration" />}>Nuova configurazione</Button>
      </div>

      <div
        role="note"
        className="mt-6 flex gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
        <p>
          Se vengono aggiornati i prezzi del veicolo, dell&apos;allestimento o
          degli optional, la configurazione salvata verrà eliminata
          automaticamente. In quel caso dovrai ricrearla dal configuratore.
        </p>
      </div>

      {isLoading && (
        <p className="mt-10 text-muted-foreground">Caricamento…</p>
      )}

      {isError && (
        <p className="mt-10 text-destructive">
          Impossibile caricare le configurazioni.
        </p>
      )}

      {!isLoading && !isError && configurations.length === 0 && (
        <p className="mt-10 text-muted-foreground">
          Non hai ancora salvato nessuna configurazione.
        </p>
      )}

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {configurations.map((config) => (
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
    </main>
  )
}

export default MyConfigurationsPage
