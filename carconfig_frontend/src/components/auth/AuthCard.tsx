import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type AuthCardProps = {
  title: string
  description?: ReactNode
  children: ReactNode
  icon?: ReactNode
  className?: string
}

const AuthCard = ({
  title,
  description,
  children,
  icon,
  className,
}: AuthCardProps) => {
  return (
    <Card
      className={cn(
        "w-full gap-8 border-border/60 bg-card/80 px-6 py-8 shadow-none ring-0 backdrop-blur-sm sm:px-8 sm:py-10",
        className
      )}
    >
      <CardHeader className="gap-4 p-0">
        {icon && (
          <div className="flex justify-center" aria-hidden>
            {icon}
          </div>
        )}
        <div className="space-y-2 text-center">
          <CardTitle className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

export default AuthCard
