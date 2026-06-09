import { useMemo, useState } from "react"
import type { AdminField } from "@/features/Admin/admin.fields"
import { AdminCrudPanel } from "@/features/Admin/components/AdminCrudPanel"
import { AdminSectionCard } from "@/features/Admin/components/AdminSectionCard"
import { OptionalService } from "@/features/Optionals/optional.service"
import { optionalCategories } from "@/features/Optionals/optional.type"
import type { Optional } from "@/features/Optionals/optional.type"
import { TrimService } from "@/features/Trims/trim.service"
import type { Trim } from "@/features/Trims/trim.type"
import { UserService } from "@/features/Users/user.service"
import type { UserListItem, UserPayload } from "@/features/Users/user.type"
import { VehicleService } from "@/features/Vehicles/vehicle.service"
import type { Vehicle } from "@/features/Vehicles/vehicle.type"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type SectionId = "vehicles" | "trims" | "optionals" | "users"

const vehicleFields: AdminField[] = [
  { name: "brand", label: "Marca", type: "text", required: true },
  { name: "model", label: "Modello", type: "text", required: true },
  { name: "year", label: "Anno", type: "number", required: true },
  { name: "fuel_type", label: "Alimentazione", type: "text", required: true },
  {
    name: "image",
    label: "Immagine (URL o percorso)",
    type: "text",
    required: true,
    placeholder: "https://… oppure vehicles/foto.png",
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
    label: "Immagine (URL o percorso)",
    type: "text",
    required: true,
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
    type: "text",
    placeholder: "URL o percorso storage",
  },
]

const userFields: AdminField[] = [
  { name: "first_name", label: "Nome", type: "text", required: true },
  { name: "last_name", label: "Cognome", type: "text", required: true },
  { name: "age", label: "Età", type: "number", required: true },
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

export function AdminDashboard() {
  const [openSection, setOpenSection] = useState<SectionId | null>(null)
  const queryClient = useQueryClient()

  const vehiclesEnabled =
    openSection === "vehicles" ||
    openSection === "trims" ||
    openSection === "optionals"

  const vehiclesQuery = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: () => VehicleService.list(),
    enabled: vehiclesEnabled,
  })

  const trimsQuery = useQuery({
    queryKey: ["admin", "trims"],
    queryFn: () => TrimService.list(),
    enabled: openSection === "trims",
  })

  const optionalsQuery = useQuery({
    queryKey: ["admin", "optionals"],
    queryFn: () => OptionalService.list(),
    enabled: openSection === "optionals",
  })

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => UserService.list(),
    enabled: openSection === "users",
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

  return (
    <div className="space-y-4">
      <AdminSectionCard
        title="Veicoli"
        description="Catalogo modelli disponibili nel configuratore"
        open={openSection === "vehicles"}
        onOpenChange={(open) => setOpenSection(open ? "vehicles" : null)}
      >
        <AdminCrudPanel<Vehicle>
          items={vehicles}
          isLoading={vehiclesQuery.isLoading}
          isError={vehiclesQuery.isError}
          fields={vehicleFields}
          emptyMessage="Nessun veicolo presente."
          getTitle={(item) => vehicleLabel(item)}
          getSubtitle={(item) =>
            `${item.fuel_type} · da €${item.base_price.toLocaleString("it-IT")}`
          }
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
            image: String(values.image),
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
        title="Allestimenti"
        description="Trim e versioni collegate ai veicoli"
        open={openSection === "trims"}
        onOpenChange={(open) =>
          setOpenSection(open ? "trims" : null)
        }
      >
        <AdminCrudPanel<Trim>
          items={trimsQuery.data?.data.data ?? []}
          isLoading={trimsQuery.isLoading}
          isError={trimsQuery.isError}
          fields={trimsFields}
          emptyMessage="Nessun allestimento presente."
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
            img: String(values.img),
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
        open={openSection === "optionals"}
        onOpenChange={(open) => setOpenSection(open ? "optionals" : null)}
      >
        <AdminCrudPanel<Optional>
          items={optionalsQuery.data?.data.data ?? []}
          isLoading={optionalsQuery.isLoading}
          isError={optionalsQuery.isError}
          fields={optionalsFields}
          emptyMessage="Nessun optional presente."
          getTitle={(item) => item.name}
          getSubtitle={(item) => `${item.category} · €${item.price.toLocaleString("it-IT")}`}
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
            image: values.image ? String(values.image) : null,
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
        open={openSection === "users"}
        onOpenChange={(open) => setOpenSection(open ? "users" : null)}
      >
        <AdminCrudPanel<UserListItem>
          items={usersQuery.data?.data.data ?? []}
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          fields={userFields}
          emptyMessage="Nessun utente presente."
          getTitle={(item) => `${item.first_name} ${item.last_name}`}
          getSubtitle={(item) => `${item.email} · ${item.role}`}
          mapItemToForm={(item) => ({
            first_name: item.first_name,
            last_name: item.last_name,
            age: item.age,
            email: item.email,
            role: item.role,
            password: "",
            password_confirmation: "",
          })}
          buildPayload={(values) => {
            const payload: Record<string, unknown> = {
              first_name: String(values.first_name),
              last_name: String(values.last_name),
              age: Number(values.age),
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
