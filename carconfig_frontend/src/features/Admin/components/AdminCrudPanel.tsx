import { useEffect, useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/features/Admin/admin.errors"
import type { AdminField } from "@/features/Admin/admin.fields"

type AdminCrudPanelProps<T extends { id: number }> = {
  items: T[]
  isLoading: boolean
  isError: boolean
  fields: AdminField[]
  emptyMessage: string
  getTitle: (item: T) => string
  getSubtitle?: (item: T) => string
  mapItemToForm: (item: T) => Record<string, string | number | boolean>
  buildPayload: (values: Record<string, string | number | boolean>) => unknown
  onCreate: (payload: unknown) => Promise<unknown>
  onUpdate: (id: number, payload: unknown) => Promise<unknown>
  onDelete: (id: number) => Promise<unknown>
  isSaving?: boolean
}

function emptyForm(fields: AdminField[]) {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === "checkbox" ? false : "",
    ])
  ) as Record<string, string | number | boolean>
}

export function AdminCrudPanel<T extends { id: number }>({
  items,
  isLoading,
  isError,
  fields,
  emptyMessage,
  getTitle,
  getSubtitle,
  mapItemToForm,
  buildPayload,
  onCreate,
  onUpdate,
  onDelete,
  isSaving = false,
}: AdminCrudPanelProps<T>) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [values, setValues] = useState(() => emptyForm(fields))

  useEffect(() => {
    if (!formOpen) {
      setValues(emptyForm(fields))
      setEditingId(null)
    }
  }, [formOpen, fields])

  const visibleFields = fields.filter((field) => {
    if (editingId !== null && field.createOnly) return false
    if (editingId !== null && field.hideOnEdit) return false
    return true
  })

  function openCreate() {
    setEditingId(null)
    setValues(emptyForm(fields))
    setFormOpen(true)
  }

  function openEdit(item: T) {
    setEditingId(item.id)
    setValues(mapItemToForm(item))
    setFormOpen(true)
  }

  function setField(name: string, value: string | number | boolean) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    try {
      const payload = buildPayload(values)

      if (editingId === null) {
        await onCreate(payload)
        toast.success("Elemento creato")
      } else {
        await onUpdate(editingId, payload)
        toast.success("Elemento aggiornato")
      }

      setFormOpen(false)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          editingId === null
            ? "Impossibile creare l'elemento"
            : "Impossibile aggiornare l'elemento"
        )
      )
    }
  }

  async function handleDelete(item: T) {
    const label = getTitle(item)
    if (!window.confirm(`Eliminare "${label}"?`)) return

    try {
      await onDelete(item.id)
      toast.success("Elemento eliminato")
      if (editingId === item.id) {
        setFormOpen(false)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossibile eliminare l'elemento"))
    }
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
          Aggiungi
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border/80 bg-muted/20 p-4"
        >
          <p className="text-sm font-medium">
            {editingId === null ? "Nuovo elemento" : "Modifica elemento"}
          </p>
          <FieldGroup className="gap-4">
            {visibleFields.map((field) => (
              <Field key={field.name}>
                {field.type === "checkbox" ? (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(values[field.name])}
                      onCheckedChange={(checked) =>
                        setField(field.name, checked === true)
                      }
                    />
                    {field.label}
                  </label>
                ) : (
                  <>
                    <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        value={String(values[field.name] ?? "")}
                        onChange={(event) =>
                          setField(field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        id={field.name}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        value={String(values[field.name] ?? "")}
                        onChange={(event) =>
                          setField(field.name, event.target.value)
                        }
                        required={field.required}
                      >
                        <option value="">Seleziona…</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.name}
                        type={
                          field.type === "number"
                            ? "number"
                            : field.type === "password"
                              ? "password"
                              : "text"
                        }
                        value={String(values[field.name] ?? "")}
                        onChange={(event) =>
                          setField(
                            field.name,
                            field.type === "number"
                              ? Number(event.target.value)
                              : event.target.value
                          )
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                  </>
                )}
              </Field>
            ))}
          </FieldGroup>
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
        <p className="text-sm text-muted-foreground">Caricamento…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Errore nel caricamento. Riprova più tardi.
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/80">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{getTitle(item)}</p>
                {getSubtitle && (
                  <p className="truncate text-sm text-muted-foreground">
                    {getSubtitle(item)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Modifica"
                  onClick={() => openEdit(item)}
                  disabled={isSaving}
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  aria-label="Elimina"
                  onClick={() => handleDelete(item)}
                  disabled={isSaving}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
