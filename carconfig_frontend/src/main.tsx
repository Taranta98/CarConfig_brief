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
import AdminPage from "./pages/AdminPage"
import MainLayout from "./layouts/MainLayout"
import AuthLayout from "./layouts/AuthLayout"
import EmailVerifyPage from "./pages/EmailVerifyPage"
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage"
import LoginPage from "./pages/Auth/LoginPage"
import RegisterPage from "./pages/Auth/RegisterPage"
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage"

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
        path: "/configuration/:vehicleId?",
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
      {
        path: "/admin",
        element: <AdminPage></AdminPage>,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout></AuthLayout>,
    children: [
      {
        path: "/auth/register",
        element: <RegisterPage></RegisterPage>,
      },
      {
        path: "/auth/login",
        element: <LoginPage></LoginPage>,
      },
      {
        path: "/auth/forgot-password",
        element: <ForgotPasswordPage></ForgotPasswordPage>,
      },
      {
        path: "/auth/reset-password",
        element: <ResetPasswordPage></ResetPasswordPage>,
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
