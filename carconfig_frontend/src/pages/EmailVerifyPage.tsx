import { AuthService } from "@/features/Auth/AuthService"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { toast } from "sonner"

const EmailVerifyPage = () => {
  const { id, hash } = useParams<{ id: string; hash: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState("Verifica email in corso...")
  const started = useRef(false)

  useEffect(() => {
    if (started.current || !id || !hash) return
    started.current = true

    const expires = searchParams.get("expires")
    const signature = searchParams.get("signature")

    if (!expires || !signature) {
      setMessage("Link di verifica non valido.")
      toast.error("Link di verifica non valido.")
      return
    }

    AuthService.verifyEmailFromLink(id, hash, { expires, signature })
      .then(() => {
        setMessage("Email verificata! Accesso effettuato.")
        toast.success("Email verificata con successo")

        if (window.opener && !window.opener.closed) {
          window.opener.focus()
          window.close()
          return
        }

        navigate("/", { replace: true })
      })
      .catch(() => {
        setMessage("Link non valido o scaduto.")
        toast.error("Impossibile verificare l'email")
      })
  }, [hash, id, navigate, searchParams])

  return (
    <section className="flex min-h-screen items-center justify-center bg-foreground dark:bg-background">
      <p className="text-card-foreground">{message}</p>
    </section>
  )
}

export default EmailVerifyPage
