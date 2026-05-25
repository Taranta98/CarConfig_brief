import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import "./index.css"

import { createBrowserRouter, RouterProvider } from "react-router"
import { ThemeProvider } from "@/components/theme-provider.tsx"

import HomePage from "./pages/HomePage"
import ConfigurationPage from "./pages/ConfigurationPage"
import MainLayout from "./layouts/MainLayout"

const client = new QueryClient();

const router = createBrowserRouter([

  {
    path:'/',
    element:<MainLayout></MainLayout>,
    children:[
  {
    index: true,
    element:<HomePage></HomePage>
  },
  {
    path:'/configuration',
    element:<ConfigurationPage></ConfigurationPage>
  },
]
}


])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client = {client}>
      <RouterProvider router={router}  />

      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
