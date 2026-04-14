import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'

import './assets/Tooltip.css'

export enum TooltipPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

interface TooltipProps extends Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'title'
> {
  children: ReactNode
  tooltipPosition: ValueOf<TooltipPosition>
  title?: ReactNode
  text: string
}

const Tooltip = ({
  children,
  tooltipPosition = TooltipPosition.BOTTOM,
  title,
  text,
  ...rest
}: TooltipProps) => {
  return (
    <div className="tooltip" {...rest}>
      {children}
      <div className={`tooltip-text ${tooltipPosition}`} role="tooltip">
        {title && <p className="subhead1-b">{title}</p>}
        <p className="subhead1-r">{text}</p>
      </div>
    </div>
  )
}

export default Tooltip
