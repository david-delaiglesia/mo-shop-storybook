export interface AddressResponse {
  id: number
  address: string
  address_detail?: string
  postal_code: string
  town?: string
  comments?: string
  latitude: string
  longitude: string
  entered_manually: boolean
  permanent_address: boolean
}

export interface Address {
  id: number
  address: string
  detail: string
  comments: string
  enteredManually: boolean
  latitude: string
  longitude: string
  permanent: boolean
  postalCode: string
  town: string
}
