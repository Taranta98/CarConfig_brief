import { useEffect, useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/features/Admin/admin.errors"
import {
  adminFieldSpanClass,
  adminFormGridClass,
  adminInputClassName,
  adminSelectClassName,
} from "@/features/Admin/admin.form"
import type { AdminField } from "@/features/Admin/admin.fields"
import Paginator from "@/components/Paginator"
import { AdminImageField } from "@/features/Admin/components/AdminImageField"
import { useClientPagination } from "@/hooks/useClientPagination"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"
import { cn } from "@/lib/utils"

export type AdminFormValue = string | number | boolean | File | null

type AdminCrudPanelProps<T extends { id: number }> = {
  items: T[]
  isLoading: boolean
  isError: boolean
  fields: AdminField[]
  emptyMessage: string
  getTitle: (item: T) => string
  getSubtitle?: (item: T) => string
  renderLeading?: (item: T) => React.ReactNode
  mapItemToForm: (item: T) => Record<string, AdminFormValue>
  buildPayload: (values: Record<string, AdminFormValue>) => unknown
  onCreate: (payload: unknown) => Promise<unknown>
  onUpdate: (id: number, payload: unknown) => Promise<unknown>
  onDelete: (id: number) => Promise<unknown>
  onRetry?: () => void
  isSaving?: boolean
  pageSize?: number
}

function emptyForm(fields: AdminField[]) {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === "checkbox" ? false : field.type === "color" ? "#000000" : "",
    ])
  ) as Record<string, AdminFormValue>
}

export function AdminCrudPanel<T extends { id: number }>({
  items,
  isLoading,
  isError,
  fields,
  emptyMessage,
  getTitle,
  getSubtitle,
  renderLeading,
  mapItemToForm,
  buildPayload,
  onCreate,
  onUpdate,
  onDelete,
  onRetry,
  isSaving = false,
  pageSize = DEFAULT_PAGE_SIZE,
}: AdminCrudPanelProps<T>) {
  const { metadata, paginatedItems, setPage } = useClientPagination(items, pageSize)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [values, setValues] = useState<Record<string, AdminFormValue>>(() =>
    emptyForm(fields)
  )

  useEffect(() => {
    if (!formOpen) {
      setValues(emptyForm(fields))
      setEditingId(null)
    }
  }, [formOpen, fields])

  const visibleFields = fields.filter((field) => {
    if (editingId === null && field.hideOnCreate) return false
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

  function setField(name: string, value: AdminFormValue) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function hasImageValue(value: AdminFormValue): boolean {
    if (value instanceof File) {
      return true
    }

    return typeof value === "string" && value.trim() !== ""
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    for (const field of visibleFields) {
      if (field.type !== "image" || !field.required) {
        continue
      }

      if (!hasImageValue(values[field.name])) {
        toast.error(`Seleziona un file o inserisci un percorso per: ${field.label}`)
        return
      }
    }

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
    try {
      await onDelete(item.id)
      toast.success("Elemento eliminato")
      setPendingDeleteId(null)
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
          <div className={adminFormGridClass("gap-4")}>
            {visibleFields.map((field) => (
              <Field key={field.name} className={adminFieldSpanClass(field)}>
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
                ) : field.type === "image" ? (
                  <>
                    <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                    <AdminImageField
                      id={field.name}
                      label={field.label}
                      value={
                        values[field.name] instanceof File
                          ? ""
                          : String(values[field.name] ?? "")
                      }
                      file={(() => {
                        const fieldValue = values[field.name]
                        return fieldValue instanceof File ? fieldValue : null
                      })()}
                      placeholder={field.placeholder}
                      onValueChange={(value) => setField(field.name, value)}
                      onFileChange={(file) => setField(field.name, file)}
                    />
                  </>
                ) : field.type === "color" ? (
                  <>
                    <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                    <div className="flex w-full min-w-0 items-center gap-2">
                      <input
                        type="color"
                        value={String(values[field.name] ?? "#000000")}
                        onChange={(event) =>
                          setField(field.name, event.target.value)
                        }
                        className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
                        aria-label={`Selettore ${field.label}`}
                      />
                      <Input
                        id={field.name}
                        className={cn(adminInputClassName, "min-w-0 flex-1")}
                        value={String(values[field.name] ?? "")}
                        onChange={(event) =>
                          setField(field.name, event.target.value)
                        }
                        placeholder="#RRGGBB"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        required={field.required}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        className={adminInputClassName}
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
                        className={adminSelectClassName}
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
                        className={adminInputClassName}
                        type={
                          field.type === "number"
                            ? "number"
                            : field.type === "password"
                              ? "password"
                              : "text"
                        }
                        min={field.type === "number" ? 0 : undefined}
                        step={field.type === "number" ? 1 : undefined}
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
          <p className="text-sm text-destructive">Errore nel caricamento.</p>
          {onRetry && (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Riprova
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/80">
          {paginatedItems.map((item) => {
            const isPendingDelete = pendingDeleteId === item.id

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {renderLeading?.(item)}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{getTitle(item)}</p>
                    {getSubtitle && (
                      <p className="truncate text-sm text-muted-foreground">
                        {getSubtitle(item)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {isPendingDelete ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item)}
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
                        onClick={() => openEdit(item)}
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
                        onClick={() => setPendingDeleteId(item.id)}
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

      {!isLoading && !isError && items.length > 0 && (
        <Paginator metadata={metadata} onPageChange={setPage} />
      )}
    </div>
  )
}
