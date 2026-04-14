import { createContext } from 'react'

import type {
  ModalLegacyProps,
  ModalProps,
} from '@mercadona/mo.library.shop-ui/modal'

export interface ModalInfoLegacy extends Omit<ModalLegacyProps, 'hideModal'> {
  onClose?: () => void
}

export interface ModalInfo extends Omit<ModalProps, 'onClose'> {
  onClose?: () => void
}

interface ModalContextType {
  showModal: (modalInfo: ModalInfo) => void

  /**
   * @deprecated Use showModal instead
   */
  showModalLegacy: (modalInfo: ModalInfoLegacy) => void

  /**
   * @deprecated Use showModal instead
   */
  showSmallModalLegacy: (modalInfo: ModalInfoLegacy) => void

  hideModal: () => void
}

export const ModalContext = createContext<ModalContextType | null>(null)
