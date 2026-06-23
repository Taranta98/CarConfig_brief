import { useMemo } from "react"
import { DonutChartCard } from "@/components/charts/DonutChartCard"
import type { ChartConfig } from "@/components/ui/chart"
import type { AdminStats } from "@/features/Admin/admin.stats.service"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  user: "Utenti",
}

const ROLE_COLORS: Record<string, string> = {
  admin: "var(--chart-2)",
  user: "var(--chart-1)",
}

const VEHICLE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

type AdminStatsChartsProps = {
  stats: AdminStats | undefined
  isLoading: boolean
  isError: boolean
}

export function AdminStatsCharts({
  stats,
  isLoading,
  isError,
}: AdminStatsChartsProps) {
  const configuredVehicles = stats?.configured_vehicles ?? []
  const usersByRole = stats?.users.by_role ?? []
  const totalUsers = stats?.users.total ?? 0

  const vehicleChartConfig = useMemo(() => {
    const config: ChartConfig = {
      configurations: { label: "Configurazioni" },
    }

    configuredVehicles.forEach((vehicle, index) => {
      config[`vehicle-${vehicle.vehicle_id}`] = {
        label: vehicle.label,
        color: VEHICLE_COLORS[index % VEHICLE_COLORS.length],
      }
    })

    return config
  }, [configuredVehicles])

  const vehicleChartData = useMemo(
    () =>
      configuredVehicles.map((vehicle) => ({
        key: `vehicle-${vehicle.vehicle_id}`,
        value: vehicle.count,
        fill: `var(--color-vehicle-${vehicle.vehicle_id})`,
      })),
    [configuredVehicles]
  )

  const totalConfigurations = useMemo(
    () => vehicleChartData.reduce((acc, item) => acc + item.value, 0),
    [vehicleChartData]
  )

  const usersChartConfig = useMemo(() => {
    const config: ChartConfig = {
      users: { label: "Utenti" },
    }

    usersByRole.forEach((item) => {
      config[item.role] = {
        label: ROLE_LABELS[item.role] ?? item.role,
        color: ROLE_COLORS[item.role] ?? "var(--chart-3)",
      }
    })

    return config
  }, [usersByRole])

  const usersChartData = useMemo(
    () =>
      usersByRole.map((item) => ({
        key: item.role,
        value: item.count,
        fill: `var(--color-${item.role})`,
      })),
    [usersByRole]
  )

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-[320px] animate-pulse rounded-xl bg-muted/60"
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-destructive">
        Impossibile caricare le statistiche.
      </p>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DonutChartCard
        title="Auto più configurate"
        config={vehicleChartConfig}
        data={vehicleChartData}
        centerValue={totalConfigurations}
        centerLabel="Configurazioni"
        emptyMessage="Nessuna configurazione."
      />
      <DonutChartCard
        title="Utenti"
        config={usersChartConfig}
        data={usersChartData}
        centerValue={totalUsers}
        centerLabel="Utenti"
        emptyMessage="Nessun utente."
      />
    </div>
  )
}
