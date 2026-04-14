import { useEffect, useRef } from 'react'

import { monitoring } from 'monitoring'

export const useVideoMirror = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mirrorRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = mirrorRef.current
    const video = videoRef.current
    if (!canvas || !video) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    let animationId: number

    const draw = () => {
      if (video.readyState > 1) {
        ctx.save()
        ctx.translate(0, canvas.height)
        ctx.scale(1, -1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
      animationId = requestAnimationFrame(draw)
    }

    const startLoop = () => {
      cancelAnimationFrame(animationId)
      animationId = requestAnimationFrame(draw)
    }

    const stopLoop = () => cancelAnimationFrame(animationId)

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        video.pause()
        stopLoop()
      } else {
        video.play().catch((error: DOMException) => {
          monitoring.captureError(
            // @ts-expect-error -- Error cause option requires ES2022 lib, remove when tsconfig is updated
            new Error('[VideoSection] play() failed', { cause: error }),
          )
        })
        startLoop()
      }
    })

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [])

  return { sectionRef, videoRef, mirrorRef }
}
