import { DragEvent, useCallback, useRef, useState } from 'react'

interface UseDragDropProps {
  isEnabled: boolean
  onFileDropped: (file: File) => void
}

export const useDragDrop = ({ isEnabled, onFileDropped }: UseDragDropProps) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!isEnabled) return

      dragCounter.current += 1

      if (event.dataTransfer.items?.length) {
        setIsDragActive(true)
      }
    },
    [isEnabled],
  )

  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!isEnabled) return

      dragCounter.current -= 1

      if (dragCounter.current === 0) {
        setIsDragActive(false)
      }
    },
    [isEnabled],
  )

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      setIsDragActive(false)
      dragCounter.current = 0

      if (!isEnabled) return

      const files = Array.from(event.dataTransfer.files)

      if (files?.length) {
        onFileDropped(files[0])
      }
    },
    [isEnabled, onFileDropped],
  )

  return {
    isDragActive,
    dragEvents: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  }
}
