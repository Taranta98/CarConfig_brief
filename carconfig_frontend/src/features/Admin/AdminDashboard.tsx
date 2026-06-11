import { useMemo, useState } from "react"
import type { AdminField } from "@/features/Admin/admin.fields"
import type { AdminFormValue } from "@/features/Admin/components/AdminCrudPanel"
import { AdminCrudPanel } from "@/features/Admin/components/AdminCrudPanel"
import { AdminSectionCard } from "@/features/Admin/components/AdminSectionCard"
import {
  AdminVehicleFilterBar,
  filterItemsByVehicleLabel,
} from "@/features/Admin/components/AdminVehicleFilterBar"
import { AdminVehicleColorsPanel } from "@/features/Admin/components/AdminVehicleColorsPanel"
import { OptionalService } from "@/features/Optionals/optional.service"
import { optionalCategories } from "@/features/Optionals/optional.type"
import type { Optional } from "@/features/Optionals/optional.type"
import { TrimService } from "@/features/Trims/trim.service"
import type { Trim } from "@/features/Trims/trim.type"
import { UserService } from "@/features/Users/user.service"
import type { UserListItem, UserPayload } from "@/features/Users/user.type"
import { VehicleColorService } from "@/features/Vehicles/vehicle-color.service"
import { VehicleService } from "@/features/Vehicles/vehicle.service"
import type { Vehicle, VehicleColorPayload } from "@/features/Vehicles/vehicle.type"
import { vehicleImageUrl } from "@/features/Vehicles/vehicle.utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type SectionId = "vehicles" | "colors" | "trims" | "optionals" | "users"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  user: "Utente",
}

const vehicleFields: AdminField[] = [
  { name: "brand", label: "Marca", type: "text", required: true },
  { name: "model", label: "Modello", type: "text", required: true },
  { name: "year", label: "Anno", type: "number", required: true },
  { name: "fuel_type", label: "Alimentazione", type: "text", required: true },
  {
    name: "image",
    label: "Immagine",
    type: "image",
    required: true,
    placeholder: "Oppure incolla URL o percorso storage",
  },
  { name: "co2_emissions", label: "CO₂ (g/km)", type: "text", required: true },
  { name: "base_price", label: "Prezzo base (€)", type: "number", required: true },
]

const trimFields: AdminField[] = [
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "description", label: "Descrizione", type: "textarea", required: true },
  { name: "price", label: "Prezzo (€)", type: "number", required: true },
  {
    name: "img",
    label: "Immagine (opzionale)",
    type: "image",
    placeholder: "URL o percorso storage",
  },
  { name: "vehicle_id", label: "Veicolo", type: "select", required: true },
]

const optionalFields: AdminField[] = [
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "description", label: "Descrizione", type: "textarea", required: true },
  { name: "price", label: "Prezzo (€)", type: "number", required: true },
  {
    name: "category",
    label: "Categoria",
    type: "select",
    required: true,
    options: optionalCategories.map((category) => ({
      value: category,
      label: category,
    })),
  },
  { name: "is_required", label: "Obbligatorio", type: "checkbox" },
  { name: "vehicle_id", label: "Veicolo", type: "select", required: true },
  {
    name: "image",
    label: "Immagine (opzionale)",
    type: "image",
    placeholder: "URL o percorso storage",
  },
]

const userFields: AdminField[] = [
  { name: "first_name", label: "Nome", type: "text", required: true },
  { name: "last_name", label: "Cognome", type: "text", required: true },
  { name: "email", label: "Email", type: "text", required: true },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    createOnly: true,
  },
  {
    name: "password_confirmation",
    label: "Conferma password",
    type: "password",
    required: true,
    createOnly: true,
  },
  {
    name: "role",
    label: "Ruolo",
    type: "select",
    required: true,
    options: [
      { value: "user", label: "Utente" },
      { value: "admin", label: "Admin" },
    ],
  },
]

function vehicleLabel(vehicle: Vehicle) {
  return `${vehicle.brand} ${vehicle.model} (${vehicle.year})`
}

function imagePayloadValue(value: AdminFormValue): string | File {
  if (value instanceof File) {
    return value
  }

  return String(value ?? "")
}

function optionalImagePayloadValue(
  value: AdminFormValue
): string | File | null {
  if (value instanceof File) {
    return value
  }

  const path = String(value ?? "").trim()
  return path === "" ? null : path
}

function toggleSection(
  sections: Set<SectionId>,
  id: SectionId,
  open: boolean
): Set<SectionId> {
  const next = new Set(sections)
  if (open) {
    next.add(id)
  } else {
    next.delete(id)
  }
  return next
}

export function AdminDashboard() {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set())
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [trimVehicleFilter, setTrimVehicleFilter] = useState("")
  const [optionalVehicleFilter, setOptionalVehicleFilter] = useState("")
  const queryClient = useQueryClient()

  const isOpen = (id: SectionId) => openSections.has(id)

  const vehiclesEnabled =
    isOpen("vehicles") ||
    isOpen("colors") ||
    isOpen("trims") ||
    isOpen("optionals")

  const vehiclesQuery = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: () => VehicleService.list(),
    enabled: vehiclesEnabled,
  })

  const colorsQuery = useQuery({
    queryKey: ["admin", "colors", selectedVehicleId],
    queryFn: () => VehicleColorService.list(selectedVehicleId!),
    enabled: isOpen("colors") && selectedVehicleId !== null,
  })

  const trimsQuery = useQuery({
    queryKey: ["admin", "trims"],
    queryFn: () => TrimService.list(),
    enabled: isOpen("trims"),
  })

  const optionalsQuery = useQuery({
    queryKey: ["admin", "optionals"],
    queryFn: () => OptionalService.list(),
    enabled: isOpen("optionals"),
  })

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => UserService.list(),
    enabled: isOpen("users"),
  })

  const vehicleMutations = {
    create: useMutation({
      mutationFn: (data: Omit<Vehicle, "id">) => VehicleService.create(data),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
          queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        ])
      },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Vehicle> }) =>
        VehicleService.update(id, data as Vehicle),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
          queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        ])
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => VehicleService.delete(id),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
          queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        ])
      },
    }),
  }

  const colorMutations = {
    create: useMutation({
      mutationFn: ({
        vehicleId,
        data,
      }: {
        vehicleId: number
        data: VehicleColorPayload
      }) => VehicleColorService.create(vehicleId, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["admin", "colors"] })
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Partial<VehicleColorPayload>
      }) => VehicleColorService.update(id, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["admin", "colors"] })
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => VehicleColorService.delete(id),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["admin", "colors"] })
      },
    }),
  }

  const trimMutations = {
    create: useMutation({
      mutationFn: (data: Omit<Trim, "id">) => TrimService.create(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "trims"] }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Trim> }) =>
        TrimService.update(id, data as Trim),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "trims"] }),
    }),
    remove: useMutation({
      mutationFn: (id: number) => TrimService.delete(id),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "trims"] }),
    }),
  }

  const optionalMutations = {
    create: useMutation({
      mutationFn: (data: Omit<Optional, "id">) => OptionalService.create(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "optionals"] }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Optional> }) =>
        OptionalService.update(id, data as Optional),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "optionals"] }),
    }),
    remove: useMutation({
      mutationFn: (id: number) => OptionalService.delete(id),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "optionals"] }),
    }),
  }

  const userMutations = {
    create: useMutation({
      mutationFn: (data: UserPayload) => UserService.create(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<UserPayload> }) =>
        UserService.update(id, data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    }),
    remove: useMutation({
      mutationFn: (id: number) => UserService.delete(id),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    }),
  }

  const vehicles = vehiclesQuery.data?.data.data ?? []
  const trims = trimsQuery.data?.data.data ?? []
  const optionals = optionalsQuery.data?.data.data ?? []

  const filteredTrims = useMemo(
    () =>
      filterItemsByVehicleLabel(trims, vehicles, trimVehicleFilter, vehicleLabel),
    [trims, vehicles, trimVehicleFilter]
  )

  const filteredOptionals = useMemo(
    () =>
      filterItemsByVehicleLabel(
        optionals,
        vehicles,
        optionalVehicleFilter,
        vehicleLabel
      ),
    [optionals, vehicles, optionalVehicleFilter]
  )

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        value: String(vehicle.id),
        label: vehicleLabel(vehicle),
      })),
    [vehicles]
  )

  const trimsFields = useMemo(
    () =>
      trimFields.map((field) =>
        field.name === "vehicle_id"
          ? { ...field, options: vehicleOptions }
          : field
      ),
    [vehicleOptions]
  )

  const optionalsFields = useMemo(
    () =>
      optionalFields.map((field) =>
        field.name === "vehicle_id"
          ? { ...field, options: vehicleOptions }
          : field
      ),
    [vehicleOptions]
  )

  const colorsSaving =
    colorMutations.create.isPending ||
    colorMutations.update.isPending ||
    colorMutations.remove.isPending

  return (
    <div className="space-y-4">
      <AdminSectionCard
        title="Veicoli"
        description="Catalogo modelli disponibili nel configuratore"
        open={isOpen("vehicles")}
        onOpenChange={(open) =>
          setOpenSections((prev) => toggleSection(prev, "vehicles", open))
        }
      >
        <AdminCrudPanel<Vehicle>
          items={vehicles}
          isLoading={vehiclesQuery.isLoading}
          isError={vehiclesQuery.isError}
          onRetry={() => vehiclesQuery.refetch()}
          fields={vehicleFields}
          emptyMessage="Nessun veicolo presente."
          getTitle={(item) => vehicleLabel(item)}
          getSubtitle={(item) =>
            `${item.fuel_type} · da €${item.base_price.toLocaleString("it-IT")}`
          }
          renderLeading={(item) => (
            <img
              src={vehicleImageUrl(item)}
              alt=""
              className="size-12 shrink-0 rounded-md border border-border/60 object-cover"
            />
          )}
          mapItemToForm={(item) => ({
            brand: item.brand,
            model: item.model,
            year: item.year,
            fuel_type: item.fuel_type,
            image: item.image,
            co2_emissions: item.co2_emissions,
            base_price: item.base_price,
          })}
          buildPayload={(values) => ({
            brand: String(values.brand),
            model: String(values.model),
            year: Number(values.year),
            fuel_type: String(values.fuel_type),
            image: imagePayloadValue(values.image),
            co2_emissions: String(values.co2_emissions),
            base_price: Number(values.base_price),
          })}
          onCreate={(payload) => vehicleMutations.create.mutateAsync(payload as Omit<Vehicle, "id">)}
          onUpdate={(id, payload) =>
            vehicleMutations.update.mutateAsync({
              id,
              data: payload as Partial<Vehicle>,
            })
          }
          onDelete={(id) => vehicleMutations.remove.mutateAsync(id)}
          isSaving={
            vehicleMutations.create.isPending ||
            vehicleMutations.update.isPending ||
            vehicleMutations.remove.isPending
          }
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Colori veicolo"
        description="Colori e immagini per angolazione usate nel configuratore"
        open={isOpen("colors")}
        onOpenChange={(open) =>
          setOpenSections((prev) => toggleSection(prev, "colors", open))
        }
      >
        <div className="mb-4">
          <label
            htmlFor="admin-color-vehicle"
            className="mb-1.5 block text-sm font-medium"
          >
            Veicolo
          </label>
          <select
            id="admin-color-vehicle"
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            value={selectedVehicleId ?? ""}
            onChange={(event) => {
              const value = event.target.value
              setSelectedVehicleId(value ? Number(value) : null)
            }}
          >
            <option value="">Seleziona un veicolo…</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleLabel(vehicle)}
              </option>
            ))}
          </select>
        </div>

        <AdminVehicleColorsPanel
          vehicleId={selectedVehicleId}
          colors={colorsQuery.data?.data.data ?? []}
          isLoading={colorsQuery.isLoading && selectedVehicleId !== null}
          isError={colorsQuery.isError}
          onRetry={() => colorsQuery.refetch()}
          onCreate={(payload) =>
            colorMutations.create.mutateAsync({
              vehicleId: selectedVehicleId!,
              data: payload,
            })
          }
          onUpdate={(id, payload) =>
            colorMutations.update.mutateAsync({ id, data: payload })
          }
          onDelete={(id) => colorMutations.remove.mutateAsync(id)}
          isSaving={colorsSaving}
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Allestimenti"
        description="Trim e versioni collegate ai veicoli"
        open={isOpen("trims")}
        onOpenChange={(open) =>
          setOpenSections((prev) => toggleSection(prev, "trims", open))
        }
      >
        <div className="mb-4">
          <AdminVehicleFilterBar
            id="admin-trim-vehicle-filter"
            value={trimVehicleFilter}
            onChange={setTrimVehicleFilter}
            placeholder="Filtra per modello (es. Qashqai, Tucson)…"
          />
        </div>

        <AdminCrudPanel<Trim>
          items={filteredTrims}
          isLoading={trimsQuery.isLoading}
          isError={trimsQuery.isError}
          onRetry={() => trimsQuery.refetch()}
          fields={trimsFields}
          emptyMessage={
            trimVehicleFilter.trim()
              ? "Nessun allestimento per questo modello."
              : "Nessun allestimento presente."
          }
          getTitle={(item) => item.name}
          getSubtitle={(item) => {
            const vehicle = vehicles.find((v) => v.id === item.vehicle_id)
            return vehicle
              ? `${vehicleLabel(vehicle)} · €${item.price.toLocaleString("it-IT")}`
              : `Veicolo #${item.vehicle_id} · €${item.price.toLocaleString("it-IT")}`
          }}
          mapItemToForm={(item) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            img: item.image ?? "",
            vehicle_id: item.vehicle_id,
          })}
          buildPayload={(values) => ({
            name: String(values.name),
            description: String(values.description),
            price: Number(values.price),
            img: optionalImagePayloadValue(values.img),
            vehicle_id: Number(values.vehicle_id),
          })}
          onCreate={(payload) => trimMutations.create.mutateAsync(payload as Omit<Trim, "id">)}
          onUpdate={(id, payload) =>
            trimMutations.update.mutateAsync({ id, data: payload as Partial<Trim> })
          }
          onDelete={(id) => trimMutations.remove.mutateAsync(id)}
          isSaving={
            trimMutations.create.isPending ||
            trimMutations.update.isPending ||
            trimMutations.remove.isPending
          }
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Optional"
        description="Pacchetti e accessori per veicolo"
        open={isOpen("optionals")}
        onOpenChange={(open) =>
          setOpenSections((prev) => toggleSection(prev, "optionals", open))
        }
      >
        <div className="mb-4">
          <AdminVehicleFilterBar
            id="admin-optional-vehicle-filter"
            value={optionalVehicleFilter}
            onChange={setOptionalVehicleFilter}
            placeholder="Filtra per modello (es. Qashqai, Tucson)…"
          />
        </div>

        <AdminCrudPanel<Optional>
          items={filteredOptionals}
          isLoading={optionalsQuery.isLoading}
          isError={optionalsQuery.isError}
          onRetry={() => optionalsQuery.refetch()}
          fields={optionalsFields}
          emptyMessage={
            optionalVehicleFilter.trim()
              ? "Nessun optional per questo modello."
              : "Nessun optional presente."
          }
          getTitle={(item) => item.name}
          getSubtitle={(item) => {
            const vehicle = vehicles.find((v) => v.id === item.vehicle_id)
            const vehicleName = vehicle
              ? vehicleLabel(vehicle)
              : `Veicolo #${item.vehicle_id}`

            return `${vehicleName} · ${item.category} · €${item.price.toLocaleString("it-IT")}`
          }}
          mapItemToForm={(item) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            is_required: item.is_required,
            vehicle_id: item.vehicle_id,
            image: item.image ?? "",
          })}
          buildPayload={(values) => ({
            name: String(values.name),
            description: String(values.description),
            price: Number(values.price),
            category: String(values.category),
            is_required: Boolean(values.is_required),
            vehicle_id: Number(values.vehicle_id),
            image: optionalImagePayloadValue(values.image),
          })}
          onCreate={(payload) =>
            optionalMutations.create.mutateAsync(payload as Omit<Optional, "id">)
          }
          onUpdate={(id, payload) =>
            optionalMutations.update.mutateAsync({
              id,
              data: payload as Partial<Optional>,
            })
          }
          onDelete={(id) => optionalMutations.remove.mutateAsync(id)}
          isSaving={
            optionalMutations.create.isPending ||
            optionalMutations.update.isPending ||
            optionalMutations.remove.isPending
          }
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Utenti"
        description="Account registrati e ruoli"
        open={isOpen("users")}
        onOpenChange={(open) =>
          setOpenSections((prev) => toggleSection(prev, "users", open))
        }
      >
        <AdminCrudPanel<UserListItem>
          items={usersQuery.data?.data.data ?? []}
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          onRetry={() => usersQuery.refetch()}
          fields={userFields}
          emptyMessage="Nessun utente presente."
          getTitle={(item) => `${item.first_name} ${item.last_name}`}
          getSubtitle={(item) =>
            `${item.email} · ${ROLE_LABELS[item.role] ?? item.role}`
          }
          mapItemToForm={(item) => ({
            first_name: item.first_name,
            last_name: item.last_name,
            email: item.email,
            role: item.role,
            password: "",
            password_confirmation: "",
          })}
          buildPayload={(values) => {
            const payload: Record<string, unknown> = {
              first_name: String(values.first_name),
              last_name: String(values.last_name),
              email: String(values.email),
              role: String(values.role),
            }

            if (values.password) {
              payload.password = String(values.password)
              payload.password_confirmation = String(values.password_confirmation)
            }

            return payload
          }}
          onCreate={(payload) =>
            userMutations.create.mutateAsync(payload as UserPayload)
          }
          onUpdate={(id, payload) =>
            userMutations.update.mutateAsync({
              id,
              data: payload as Partial<UserPayload>,
            })
          }
          onDelete={(id) => userMutations.remove.mutateAsync(id)}
          isSaving={
            userMutations.create.isPending ||
            userMutations.update.isPending ||
            userMutations.remove.isPending
          }
        />
      </AdminSectionCard>
    </div>
  )
}
