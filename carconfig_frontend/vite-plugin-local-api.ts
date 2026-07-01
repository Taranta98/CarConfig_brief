import type { IncomingMessage, ServerResponse } from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadEnv, type Plugin, type ViteDevServer } from "vite"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const API_ROUTES: Record<string, string> = {
  "/api/blob/upload": path.join(projectRoot, "api/blob/upload.ts"),
  "/api/blob/file": path.join(projectRoot, "api/blob/file.ts"),
}

type VercelHandler = (
  request: IncomingMessage & {
    method?: string
    query: Record<string, string | string[]>
    body?: unknown
    cookies: Record<string, string>
  },
  response: ServerResponse & {
    status: (code: number) => ServerResponse
    json: (body: unknown) => void
    send: (body: unknown) => void
    setHeader: (name: string, value: string) => void
  }
) => Promise<void> | void

function parseQuery(url: string): Record<string, string> {
  const queryString = url.includes("?") ? url.slice(url.indexOf("?") + 1) : ""
  const params = new URLSearchParams(queryString)
  const query: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    query[key] = value
  }

  return query
}

async function readRequestBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return undefined
  }

  const raw = Buffer.concat(chunks).toString("utf8")
  const contentType = request.headers["content-type"] ?? ""

  if (contentType.includes("application/json")) {
    return JSON.parse(raw) as unknown
  }

  return raw
}

function createVercelResponse(response: ServerResponse) {
  let statusCode = 200

  const vercelResponse = response as ServerResponse & {
    status: (code: number) => typeof vercelResponse
    json: (body: unknown) => void
    send: (body: unknown) => void
  }

  vercelResponse.status = (code: number) => {
    statusCode = code
    response.statusCode = code
    return vercelResponse
  }

  vercelResponse.json = (body: unknown) => {
    if (!response.headersSent) {
      response.setHeader("Content-Type", "application/json; charset=utf-8")
      response.statusCode = statusCode
      response.end(JSON.stringify(body))
    }
  }

  vercelResponse.send = (body: unknown) => {
    if (!response.headersSent) {
      response.statusCode = statusCode

      if (Buffer.isBuffer(body)) {
        response.end(body)
        return
      }

      response.end(body == null ? "" : String(body))
    }
  }

  return vercelResponse
}

function createVercelRequest(
  request: IncomingMessage,
  body: unknown,
  query: Record<string, string>
) {
  const vercelRequest = request as IncomingMessage & {
    method?: string
    query: Record<string, string | string[]>
    body?: unknown
    cookies: Record<string, string>
  }

  vercelRequest.method = request.method
  vercelRequest.query = query
  vercelRequest.body = body
  vercelRequest.cookies = {}

  return vercelRequest
}

async function handleApiRequest(
  server: ViteDevServer,
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string
): Promise<boolean> {
  const handlerPath = API_ROUTES[pathname]

  if (!handlerPath) {
    return false
  }

  try {
    const module = await server.ssrLoadModule(handlerPath)
    const handler = module.default as VercelHandler | undefined

    if (typeof handler !== "function") {
      response.statusCode = 500
      response.end("API handler is missing a default export")
      return true
    }

    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await readRequestBody(request)

    const vercelRequest = createVercelRequest(
      request,
      body,
      parseQuery(request.url ?? "")
    )
    const vercelResponse = createVercelResponse(response)

    await handler(vercelRequest, vercelResponse)

    if (!response.headersSent) {
      response.statusCode = 404
      response.end("Not found")
    }

    return true
  } catch (error) {
    console.error(`[local-api] ${pathname} failed:`, error)
    if (!response.headersSent) {
      response.statusCode = 500
      response.setHeader("Content-Type", "application/json; charset=utf-8")
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Internal server error",
        })
      )
    }
    return true
  }
}

export function localApiPlugin(): Plugin {
  return {
    name: "local-api",
    configureServer(server) {
      // Vite exposes only VITE_* to client code; API handlers need full .env.local in process.env.
      Object.assign(
        process.env,
        loadEnv(server.config.mode, server.config.envDir, "")
      )

      server.middlewares.use(async (request, response, next) => {
        const url = request.url ?? ""
        const pathname = url.split("?")[0] ?? ""

        if (!pathname.startsWith("/api/")) {
          next()
          return
        }

        const handled = await handleApiRequest(server, request, response, pathname)

        if (!handled) {
          response.statusCode = 404
          response.end("API route not found")
        }
      })
    },
  }
}
