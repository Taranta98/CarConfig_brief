import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import "./index.css"

import { createBrowserRouter, RouterProvider } from "react-router"
import { ThemeProvider } from "@/components/theme-provider.tsx"

import HomePage from "./pages/HomePage"
import ConfigurationPage from "./pages/ConfigurationPage"
import MyConfigurationsPage from "./pages/MyConfigurationsPage"
import SettingsPage from "./pages/SettingsPage"
import MainLayout from "./layouts/MainLayout"
import AuthLayout from "./layouts/AuthLayout"
import RegisterForm from "./components/shadcn-space/blocks/register-01/register"
import EmailVerifyPage from "./pages/EmailVerifyPage"

import LoginForm from "./components/shadcn-space/blocks/login-01/login"
import LoginPage from "./pages/Auth/LoginPage"

const client = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      {
        index: true,
        element: <HomePage></HomePage>,
      },
      {
        path: "/configuration",
        element: <ConfigurationPage></ConfigurationPage>,
      },
      {
        path: "/my-configurations",
        element: <MyConfigurationsPage></MyConfigurationsPage>,
      },
      {
        path: "/settings",
        element: <SettingsPage></SettingsPage>,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout></AuthLayout>,
    children: [
      {
        path: "/auth/register",
        element: <RegisterForm></RegisterForm>,
      },
      {
        path: "/auth/login",
        element: <LoginPage></LoginPage>,
      },
      {
        path: "/auth/verify-email/:id/:hash",
        element: <EmailVerifyPage></EmailVerifyPage>,
      },
    ],
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
