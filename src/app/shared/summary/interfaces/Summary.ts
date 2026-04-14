import { TaxType } from './TaxType'

export interface SummaryResponse {
  products: string
  slot: string
  slot_bonus: string | null
  total: string
  taxes: string
  tax_base: string
  tax_type?: TaxType
  volume_extra_cost: {
    threshold: number
    cost_by_extra_liter: string
    total_extra_liters: number
    total: string
  }
}

/**
 * TODO: Define Summary interface properly using snake_case to camelCase conversion
 */
export type Summary = SummaryResponse
