import { LayoutHeaderType } from './constants'

export interface SetHeaderTypeAction {
  (headerType: LayoutHeaderType): {
    type: string
    payload: LayoutHeaderType
  }
}
