import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UserUploadingFileChatEvent } from 'app/chat/interfaces'

import './ChatFileUploading.css'

interface ChatFileUploadingProps {
  event: UserUploadingFileChatEvent
}

const MIN_PROGRESS_VALUE = 0
const MAX_PROGRESS_VALUE = 100
const MS_UPDATE_INTERVAL = 10

const getSize = (size: number) => {
  const sizeKB = (size / 1024).toFixed(0)
  return `${sizeKB}KB`
}

const ChatFileUploading = ({ event }: ChatFileUploadingProps) => {
  const [uploadProgress, setUploadProgress] =
    useState<number>(MIN_PROGRESS_VALUE)
  const { t } = useTranslation()

  useEffect(() => {
    const interval = setInterval(() => {
      setUploadProgress((prevUploadProgressValue) => {
        const nextUploadProgressValue = prevUploadProgressValue + 1
        if (nextUploadProgressValue >= MAX_PROGRESS_VALUE) {
          clearInterval(interval)
          return MAX_PROGRESS_VALUE
        }
        return nextUploadProgressValue
      })
    }, MS_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  })

  return (
    <div className="chat-file-uploading">
      <p className="chat-file-uploading__file-name subhead1-r">
        {event.payload.content.file.name}
      </p>
      <div
        className="chat-file-uploading__progress"
        role="progressbar"
        aria-valuemin={MIN_PROGRESS_VALUE}
        aria-valuemax={MAX_PROGRESS_VALUE}
        aria-valuenow={uploadProgress}
      >
        <div
          className="chat-file-uploading__progress--fill"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <div className="chat-file-uploading__detail">
        <p className="caption1-sb">
          {getSize(event.payload.content.file.size)}
        </p>
        <p
          aria-label={t('chat.conversation.file_upload_progress')}
          className="caption1-sb"
        >
          {uploadProgress}%
        </p>
      </div>
    </div>
  )
}

export { ChatFileUploading }
