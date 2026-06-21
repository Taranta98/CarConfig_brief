import { useEffect, useMemo, useRef } from "react"
import { ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { resolveStorageUrl } from "@/lib/api"
import { adminInputClassName } from "@/features/Admin/admin.form"
import { cn } from "@/lib/utils"

type AdminImageFieldProps = {
  id: string
  label: string
  value: string
  file: File | null
  placeholder?: string
  onValueChange: (value: string) => void
  onFileChange: (file: File | null) => void
}

export function AdminImageField({
  id,
  label,
  value,
  file,
  placeholder,
  onValueChange,
  onFileChange,
}: AdminImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }

    return resolveStorageUrl(value) || ""
  }, [file, value])

  useEffect(() => {
    if (!file) {
      return
    }

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [file, previewUrl])

  const hasPreview = Boolean(previewUrl)

  return (
    <div className="w-full min-w-0 space-y-2">
      <div className="flex flex-wrap items-start gap-3">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/80 bg-muted/30",
            hasPreview && "border-solid"
          )}
        >
          {hasPreview ? (
            <img
              src={previewUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={id}
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(event) => {
              onFileChange(event.target.files?.[0] ?? null)
            }}
            aria-label={`${label} da PC`}
            className="flex h-9 w-full max-w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground"
          />
          <Input
            className={adminInputClassName}
            value={value}
            onChange={(event) => {
              onValueChange(event.target.value)
              if (event.target.value) {
                onFileChange(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
              }
            }}
            placeholder={placeholder ?? "Oppure incolla URL o percorso storage"}
          />
        </div>
      </div>
      {file && (
        <p className="text-xs text-muted-foreground">
          File selezionato: {file.name}
        </p>
      )}
    </div>
  )
}
