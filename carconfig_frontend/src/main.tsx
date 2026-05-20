import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import "./index.css"

import { createBrowserRouter, RouterProvider } from "react-router"
import { ThemeProvider } from "@/components/theme-provider.tsx"

const client = new QueryClient();

const router = createBrowserRouter([
  {
    path:'/',
    element:<></>
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
