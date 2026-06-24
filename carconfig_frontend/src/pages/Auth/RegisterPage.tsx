import RegisterForm from "@/components/shadcn-space/blocks/register-01/register"
import AuthSplitLayout from "@/components/auth/AuthSplitLayout"

const RegisterPage = () => {
  return (
    <AuthSplitLayout contentClassName="max-w-lg">
      <RegisterForm />
    </AuthSplitLayout>
  )
}

export default RegisterPage
