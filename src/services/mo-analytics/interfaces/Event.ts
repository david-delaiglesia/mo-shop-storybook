export interface Event {
  name: string
  properties?: Record<string, string | boolean | number>
}

export interface EventWithUserId extends Event {
  id: string
  userId: string | null
  occurredAt: string
}
