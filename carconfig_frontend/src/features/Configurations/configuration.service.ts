import { http, type LaravelListPayload, type LaravelResourcePayload } from "@/lib/http"
import type {
  SaveConfigurationPayload,
  SavedConfiguration,
} from "./configuration.type"

export class ConfigurationService {
  static async list() {
    return http.get<LaravelListPayload<SavedConfiguration>>("/configurations")
  }

  static async save(payload: SaveConfigurationPayload) {
    return http.post<LaravelResourcePayload<SavedConfiguration>>(
      "/configurations",
      payload
    )
  }

  static async emailQuote(payload: SaveConfigurationPayload) {
    return http.post("/configurations/quote/email", payload)
  }
}
