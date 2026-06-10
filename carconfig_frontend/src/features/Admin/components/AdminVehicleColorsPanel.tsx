import { useEffect, useState } from "react"
import { ImageIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/features/Admin/admin.errors"
import { VehicleColorService } from "@/features/Vehicles/vehicle-color.service"
import {
  VEHICLE_VIEW_ANGLES,
  type VehicleColor,
  type VehicleColorImages,
  type VehicleColorPayload,
  type VehicleViewAngle,
} from "@/features/Vehicles/vehicle.type"
import { vehicleViewAngleLabels } from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"

type AdminVehicleColorsPanelProps = {
  vehicleId: number | null
  isSaving?: boolean
  onCreate: (payload: VehicleColorPayload) => Promise<unknown>
  onUpdate: (id: number, payload: Partial<VehicleColorPayload>) => Promise<unknown>
  onDelete: (id: number) => Promise<unknown>
  colors: VehicleColor[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

type ColorFormState = {
  code: string
  name: string
  hex: string
  sort_order: number
  images: Record<VehicleViewAngle, string>
}

function emptyImages(): Record<VehicleViewAngle, string> {
  return Object.fromEntries(
    VEHICLE_VIEW_ANGLES.map((angle) => [angle, ""])
  ) as Record<VehicleViewAngle, string>
}

function emptyForm(): ColorFormState {
  return {
    code: "",
    name: "",
    hex: "#000000",
    sort_order: 0,
    images: emptyImages(),
  }
}

function mapColorToForm(color: VehicleColor): ColorFormState {
  const images = emptyImages()
  for (const angle of VEHICLE_VIEW_ANGLES) {
    images[angle] = color.images[angle] ?? ""
  }

  return {
    code: color.code,
    name: color.name,
    hex: color.hex,
    sort_order: color.sort_order,
    images,
  }
}

function buildImagesPayload(
  images: Record<VehicleViewAngle, string>
): VehicleColorImages {
  return Object.fromEntries(
    VEHICLE_VIEW_ANGLES.filter((angle) => images[angle].trim() !== "").map(
      (angle) => [angle, images[angle].trim()]
    )
  )
}

function countImages(images: VehicleColorImages): number {
  return Object.keys(images).length
}

export function AdminVehicleColorsPanel({
  vehicleId,
  colors,
  isLoading,
  isError,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
  isSaving = false,
}: AdminVehicleColorsPanelProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [values, setValues] = useState<ColorFormState>(emptyForm)

  useEffect(() => {
    if (!formOpen) {
      setValues(emptyForm())
      setEditingId(null)
    }
  }, [formOpen])

  useEffect(() => {
    setFormOpen(false)
    setPendingDeleteId(null)
  }, [vehicleId])

  function openCreate() {
    setEditingId(null)
    setValues(emptyForm())
    setFormOpen(true)
  }

  function openEdit(color: VehicleColor) {
    setEditingId(color.id)
    setValues(mapColorToForm(color))
    setFormOpen(true)
  }

  function setImage(angle: VehicleViewAngle, value: string) {
    setValues((prev) => ({
      ...prev,
      images: { ...prev.images, [angle]: value },
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const images = buildImagesPayload(values.images)

    if (editingId === null && countImages(images) === 0) {
      toast.error("Inserisci almeno un'immagine per un'angolazione.")
      return
    }

    const payload: VehicleColorPayload = {
      code: values.code.trim(),
      name: values.name.trim(),
      hex: values.hex.toUpperCase(),
      sort_order: values.sort_order,
      images,
    }

    try {
      if (editingId === null) {
        await onCreate(payload)
        toast.success("Colore creato")
      } else {
        await onUpdate(editingId, payload)
        toast.success("Colore aggiornato")
      }
      setFormOpen(false)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          editingId === null
            ? "Impossibile creare il colore"
            : "Impossibile aggiornare il colore"
        )
      )
    }
  }

  async function handleDelete(color: VehicleColor) {
    try {
      await onDelete(color.id)
      toast.success("Colore eliminato")
      setPendingDeleteId(null)
      if (editingId === color.id) {
        setFormOpen(false)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossibile eliminare il colore"))
    }
  }

  if (vehicleId === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Seleziona un veicolo per gestire i colori e le immagini per angolazione.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          onClick={openCreate}
          disabled={isSaving}
        >
          <PlusIcon className="size-4" />
          Aggiungi colore
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border/80 bg-muted/20 p-4"
        >
          <p className="text-sm font-medium">
            {editingId === null ? "Nuovo colore" : "Modifica colore"}
          </p>

          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="color-code">Codice</FieldLabel>
                <Input
                  id="color-code"
                  value={values.code}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="es. white"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="color-name">Nome</FieldLabel>
                <Input
                  id="color-name"
                  value={values.name}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Bianco perla"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="color-hex">Colore hex</FieldLabel>
                <div className="flex items-center gap-2">
                  <input
                    id="color-hex-picker"
                    type="color"
                    value={values.hex}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, hex: e.target.value }))
                    }
                    className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
                    aria-label="Selettore colore"
                  />
                  <Input
                    id="color-hex"
                    value={values.hex}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, hex: e.target.value }))
                    }
                    placeholder="#RRGGBB"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="color-sort">Ordine</FieldLabel>
                <Input
                  id="color-sort"
                  type="number"
                  min={0}
                  step={1}
                  value={values.sort_order}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      sort_order: Number(e.target.value),
                    }))
                  }
                />
              </Field>
            </div>
          </FieldGroup>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Immagini per angolazione</p>
              <p className="text-xs text-muted-foreground">
                Anteriore, posteriore e laterale. Almeno un&apos;angolazione è
                obbligatoria in creazione.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {VEHICLE_VIEW_ANGLES.map((angle) => (
                <Field key={angle}>
                  <FieldLabel htmlFor={`angle-${angle}`}>
                    {vehicleViewAngleLabels[angle]}
                  </FieldLabel>
                  <Input
                    id={`angle-${angle}`}
                    value={values.images[angle]}
                    onChange={(e) => setImage(angle, e.target.value)}
                    placeholder="URL o percorso"
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={isSaving}>
              {editingId === null ? "Crea" : "Salva"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={isSaving}
            >
              Annulla
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg bg-muted/60"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">
            Errore nel caricamento dei colori.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Riprova
          </Button>
        </div>
      )}

      {!isLoading && !isError && colors.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nessun colore per questo veicolo.
        </p>
      )}

      {!isLoading && !isError && colors.length > 0 && (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/80">
          {colors.map((color) => {
            const previewUrl =
              color.images.side ??
              Object.values(color.images).find(Boolean) ??
              null
            const isPendingDelete = pendingDeleteId === color.id

            return (
              <li
                key={color.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="size-8 shrink-0 rounded-full border border-border/80"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-md border border-border/60 object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30">
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{color.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {color.code} · {color.hex} · {countImages(color.images)}{" "}
                      angolazioni
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {isPendingDelete ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(color)}
                        disabled={isSaving}
                      >
                        Conferma
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setPendingDeleteId(null)}
                        disabled={isSaving}
                      >
                        Annulla
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Modifica"
                        onClick={() => openEdit(color)}
                        disabled={isSaving}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className={cn(
                          "text-destructive hover:text-destructive"
                        )}
                        aria-label="Elimina"
                        onClick={() => setPendingDeleteId(color.id)}
                        disabled={isSaving}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
