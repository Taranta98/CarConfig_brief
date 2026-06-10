import Logo from "@/components/Logo"
import type { ReactNode } from "react"
import { Link } from "react-router"

type AuthSplitLayoutProps = {
  children: ReactNode
}

const AuthSplitLayout = ({ children }: AuthSplitLayoutProps) => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="flex min-h-[280px] flex-col items-center justify-center bg-black px-8 py-12 text-white lg:min-h-screen lg:px-12">
        <Link to="/" className="flex flex-col items-center gap-8">
          <Logo variant="white" className="h-14 w-auto" />
          <div className="max-w-sm text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Car Config</h1>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              Configura il veicolo dei tuoi sogni e gestisci le tue
              configurazioni in un unico posto.
            </p>
          </div>
        </Link>
      </aside>

      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}

export default AuthSplitLayout
