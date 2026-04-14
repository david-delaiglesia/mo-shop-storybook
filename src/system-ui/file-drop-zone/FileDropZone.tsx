import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useDragDrop } from './useDragDrop'

import { Document } from 'system-ui/icons'

import './FileDropZone.css'

interface FileDropZoneProps {
  children: ReactNode
  isConversationActive: boolean
  onSendFile: (file: File) => void
}

const FileDropZone = ({
  children,
  isConversationActive,
  onSendFile,
}: FileDropZoneProps) => {
  const { t } = useTranslation()
  const { isDragActive, dragEvents } = useDragDrop({
    isEnabled: isConversationActive,
    onFileDropped: onSendFile,
  })

  return (
    <div className="file-drop-zone" {...dragEvents}>
      {children}
      {isDragActive && (
        <section
          className="file-drop-zone__overlay"
          aria-labelledby="file-drop-zone-title"
        >
          <div className="file-drop-zone__dashed-area">
            <div className="file-drop-zone__icon">
              <Document role="presentation" />
            </div>
            <h2
              id="file-drop-zone-title"
              className="title2-b file-drop-zone__message"
            >
              {t('chat.drag_and_drop.overlay.title')}
            </h2>
            <p className="footnote1-r file-drop-zone__tagline">
              {t('chat.drag_and_drop.overlay.subtitle')}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

export { FileDropZone }
