import { useAuthStore } from "@/features/Auth/auth.store"
import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"
import { Toaster } from "sonner"

const AuthLayout = () => {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true })
    }
  }, [navigate, token])

  if (token) {
    return null
  }

  return (
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  )
}

export default AuthLayout
