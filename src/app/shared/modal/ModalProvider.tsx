import { type ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  ModalContext,
  type ModalInfo,
  type ModalInfoLegacy,
} from './ModalContext'

import {
  MediumModal,
  Modal,
  SmallModal,
} from '@mercadona/mo.library.shop-ui/modal'

const SIZES = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
}

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isVisibleLegacy, setModalVisibilityLegacy] = useState(false)
  const [size, setSize] = useState(SIZES.MEDIUM)
  const [modalInfoLegacy, setModalInfoLegacy] =
    useState<ModalInfoLegacy | null>(null)

  const [isVisible, setModalVisibility] = useState(false)
  const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null)

  const showModal = (modalInfo: ModalInfo) => {
    setModalInfo(modalInfo)
    setModalVisibility(true)
  }

  const showModalLegacy = (modalInfo: ModalInfoLegacy) => {
    setSize(SIZES.MEDIUM)
    setModalInfoLegacy(modalInfo)
    setModalVisibilityLegacy(true)
  }

  const showSmallModalLegacy = (modalInfo: ModalInfoLegacy) => {
    setSize(SIZES.SMALL)
    setModalInfoLegacy(modalInfo)
    setModalVisibilityLegacy(true)
  }

  const hideModal = () => {
    setModalVisibilityLegacy(false)
    setModalInfoLegacy(null)
    modalInfoLegacy?.onClose?.()

    setModalVisibility(false)
    setModalInfo(null)
    modalInfo?.onClose?.()
  }

  const isSmallModal = size === SIZES.SMALL

  const ModalComponent = isSmallModal ? SmallModal : MediumModal

  return (
    <ModalContext.Provider
      value={{
        showModal,
        showModalLegacy,
        showSmallModalLegacy,
        hideModal,
      }}
    >
      {isVisibleLegacy &&
        modalInfoLegacy &&
        createPortal(
          <ModalComponent {...modalInfoLegacy} hideModal={hideModal} />,
          document.getElementById('modal-info')!,
        )}

      {isVisible &&
        modalInfo &&
        createPortal(
          <Modal {...modalInfo} onClose={hideModal} />,
          document.getElementById('modal-info')!,
        )}
      {children}
    </ModalContext.Provider>
  )
}
