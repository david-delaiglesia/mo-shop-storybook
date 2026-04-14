export interface SlotResponse {
  id: string
  start: string
  end: string
  price: string
  discount?: string
  available: boolean
  open?: boolean
  timezone: string
  cutoff_time: string
}

// TODO: pending to migrate to camel case in serializer
export interface Slot {
  id: string
  start: string
  end: string
  available: boolean
  open?: boolean
  price: string
  cutoff_time: string
  timezone: string
}
