// WIP interface for User backend response
export interface UserResponse {
  id: number
  uuid: string
  email: string
  name: string
  last_name: string
  current_postal_code?: string
  cart_id?: string
  has_active_billing: boolean
  has_requested_account_deletion: boolean
}
