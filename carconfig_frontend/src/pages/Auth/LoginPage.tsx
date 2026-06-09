import LoginForm from "@/components/shadcn-space/blocks/login-01/login"
import AuthSplitLayout from "@/components/auth/AuthSplitLayout"

const LoginPage = () => {
  return (
    <AuthSplitLayout>
      <LoginForm />
    </AuthSplitLayout>
  )
}

export default LoginPage
