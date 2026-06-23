import Header from "@/components/shadcn-studio/blocks/hero-section-41/header"
import { Toaster } from "sonner"
import { Outlet } from "react-router"

const WebsiteLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Toaster position="top-center" />
    </>
  )
}

export default WebsiteLayout
