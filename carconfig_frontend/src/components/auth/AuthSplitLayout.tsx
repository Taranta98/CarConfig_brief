import Logo from "@/components/Logo"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, MoonIcon, SunIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"

type AuthSplitLayoutProps = {
  children: ReactNode
  contentClassName?: string
}

function getResolvedTheme(theme: string) {
  if (theme === "dark" || theme === "light") {
    return theme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const AuthSplitLayout = ({
  children,
  contentClassName,
}: AuthSplitLayoutProps) => {
  const { theme, setTheme } = useTheme()
  const isDark = getResolvedTheme(theme) === "dark"

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0A0A0B] px-10 py-12 text-white lg:flex xl:px-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 4%) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 4%) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-white/[0.04] blur-3xl"
          aria-hidden
        />

        <Link
          to="/"
          className="relative z-10 flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]"
        >
          <Logo variant="white" className="size-10" alt="" aria-hidden />
          <span className="text-[13px] font-medium uppercase tracking-[0.14em]">
            CARCONFIG
          </span>
        </Link>

        <div className="relative z-10 max-w-sm space-y-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
            Configuratore online
          </p>
          <h1 className="text-3xl font-medium leading-tight tracking-tight xl:text-4xl">
            Progetta il veicolo che riflette il tuo stile.
          </h1>
          <p className="text-sm leading-relaxed text-white/60">
            Colori, interni e optional in un&apos;esperienza fluida. Salva le
            tue configurazioni e riprendi da dove avevi lasciato.
          </p>
        </div>

        <p className="relative z-10 text-[11px] uppercase tracking-[0.18em] text-white/35">
          Design · Performance · Personalizzazione
        </p>
      </aside>

      <div className="relative flex min-h-screen flex-col overflow-y-auto bg-background">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10 lg:py-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
            render={<Link to="/" />}
            nativeButton={false}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Torna al sito</span>
          </Button>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/"
              className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Logo className="size-8" alt="" aria-hidden />
              <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-foreground">
                CARCONFIG
              </span>
            </Link>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "size-9 rounded-full text-muted-foreground hover:text-foreground",
              "lg:ml-auto"
            )}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
            <span className="sr-only">Cambia tema</span>
          </Button>
        </header>

        <main className="flex w-full flex-1 items-start justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className={cn("w-full max-w-md", contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuthSplitLayout
