import { ConfigurationListCard } from "@/features/Configurations/components/ConfigurationListCard"
import { ConfigurationService } from "@/features/Configurations/configuration.service"
import { useAuthStore } from "@/features/Auth/auth.store"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router"
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
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables === config.id
              }
            />
          </li>
        ))}
      </ul>
    </main>
  )
}

export default MyConfigurationsPage
