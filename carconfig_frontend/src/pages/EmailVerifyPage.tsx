import AuthSplitLayout from "@/components/auth/AuthSplitLayout"
import AuthCard from "@/components/auth/AuthCard"
import { AuthService } from "@/features/Auth/auth.service"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { toast } from "sonner"

type VerifyStatus = "loading" | "success" | "error"

const EmailVerifyPage = () => {
  const { id, hash } = useParams<{ id: string; hash: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<VerifyStatus>("loading")
  const started = useRef(false)

  useEffect(() => {
    if (started.current || !id || !hash) {
      return
    }
    started.current = true

    const expires = searchParams.get("expires")
    const signature = searchParams.get("signature")

    if (!expires || !signature) {
      setStatus("error")
      toast.error("Link di verifica non valido.")
      return
    }

    AuthService.verifyEmailFromLink(id, hash, { expires, signature })
      .then(() => {
        setStatus("success")
        toast.success("Email verificata con successo")

        if (window.opener && !window.opener.closed) {
          window.opener.focus()
          window.close()
          return
        }

        window.setTimeout(() => {
          navigate("/", { replace: true })
        }, 2000)
      })
      .catch(() => {
        setStatus("error")
        toast.error("Impossibile verificare l'email")
      })
  }, [hash, id, navigate, searchParams])

  const content = {
    loading: {
      title: "Verifica in corso",
      description:
        "Stiamo confermando il tuo indirizzo email. Attendi qualche istante.",
      icon: (
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="size-7 animate-spin" />
        </div>
      ),
      action: null,
    },
    success: {
      title: "Email verificata",
      description:
        "Il tuo account è attivo. Verrai reindirizzato alla home tra pochi secondi.",
      icon: (
        <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-7" />
        </div>
      ),
      action: (
        <Button
          size="lg"
          className="h-11 w-full rounded-full font-medium"
          render={<Link to="/" />}
          nativeButton={false}
        >
          Vai al configuratore
        </Button>
      ),
    },
    error: {
      title: "Link non valido",
      description:
        "Il link di verifica è scaduto o non è più valido. Richiedi una nuova email di attivazione.",
      icon: (
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-7" />
        </div>
      ),
      action: (
        <Button
          size="lg"
          variant="outline"
          className="h-11 w-full rounded-full"
          render={<Link to="/auth/login" />}
          nativeButton={false}
        >
          Torna al login
        </Button>
      ),
    },
  }[status]

  return (
    <AuthSplitLayout>
      <AuthCard
        title={content.title}
        description={content.description}
        icon={content.icon}
      >
        {content.action}
      </AuthCard>
    </AuthSplitLayout>
  )
}

export default EmailVerifyPage
