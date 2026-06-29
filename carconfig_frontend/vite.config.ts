import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { localApiPlugin } from "./vite-plugin-local-api"

// https://vite.dev/config/
export default defineConfig({
  plugins: [localApiPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
