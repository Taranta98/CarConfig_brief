import { ChevronDownIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

type AdminSectionCardProps = {
  title: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function AdminSectionCard({
  title,
  description,
  open,
  onOpenChange,
  children,
}: AdminSectionCardProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className="border-border/60 py-0 shadow-none">
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 px-6 py-5 text-left transition-colors hover:bg-muted/40"
            />
          }
        >
          <div className="min-w-0 flex-1 text-center">
            <CardHeader className="gap-0 p-0">
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </CardHeader>
          </div>
          <ChevronDownIcon
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-top-2">
          <CardContent className="border-t border-border/60 pt-2 pb-6">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
