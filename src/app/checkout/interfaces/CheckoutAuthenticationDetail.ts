export interface CheckoutAuthenticationDetailResponse {
  remaining_time: number
  estimated_amount: string
  margin_amount?: string
  total_amount: string
  has_variable_weight: boolean
}

export interface CheckoutAuthenticationDetailBase {
  remainingTime: number
  estimatedAmount: string
  marginAmount?: string
  totalAmount: string
  hasVariableWeight: boolean
}

export interface CheckoutAuthenticationDetailWithVariableWeight extends CheckoutAuthenticationDetailBase {
  remainingTime: number
  estimatedAmount: string
  marginAmount: string
  totalAmount: string
  hasVariableWeight: true
}

export interface CheckoutAuthenticationDetailWithoutVariableWeight extends CheckoutAuthenticationDetailBase {
  remainingTime: number
  estimatedAmount: string
  marginAmount: undefined
  totalAmount: string
  hasVariableWeight: false
}

export type CheckoutAuthenticationDetail =
  | CheckoutAuthenticationDetailWithVariableWeight
  | CheckoutAuthenticationDetailWithoutVariableWeight
