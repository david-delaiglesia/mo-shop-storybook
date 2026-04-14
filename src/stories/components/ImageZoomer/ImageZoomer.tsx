import React, { useState, useRef } from 'react'
import './ImageZoomer.css'

export interface ImageZoomerProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  showBadge?: boolean
}

export const ImageZoomer: React.FC<ImageZoomerProps> = ({
  src,
  alt = 'Product image',
  width = 400,
  height = 400,
  showBadge = true,
}) => {
  const [zoomed, setZoomed] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [origin, setOrigin] = useState('center center')
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setLensPos({ x, y })
    const pctX = ((x / rect.width) * 100).toFixed(1)
    const pctY = ((y / rect.height) * 100).toFixed(1)
    setOrigin(`${pctX}% ${pctY}%`)
  }

  const toggle = () => setZoomed((z) => !z)

  const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect fill="#f0f0f0" width="${width}" height="${height}"/>
      <text fill="#bbb" font-family="Arial" font-size="48" x="50%" y="50%" text-anchor="middle" dy=".35em">&#x1F50D;</text>
    </svg>`,
  )}`

  return (
    <div
      ref={containerRef}
      className={`image-zoomer${zoomed ? ' image-zoomer--zoomed' : ''}`}
      style={{ width, maxWidth: '100%' }}
      onClick={toggle}
      onMouseMove={handleMouseMove}
    >
      <img
        className="image-zoomer__img"
        src={src || placeholderSvg}
        alt={alt}
        style={{ transformOrigin: zoomed ? origin : 'center center' }}
        draggable={false}
      />
      {!zoomed && (
        <div
          className="image-zoomer__lens"
          style={{ left: lensPos.x, top: lensPos.y }}
        />
      )}
      {showBadge && (
        <span className="image-zoomer__badge">
          {zoomed ? 'Click to zoom out' : 'Click to zoom'}
        </span>
      )}
    </div>
  )
}
