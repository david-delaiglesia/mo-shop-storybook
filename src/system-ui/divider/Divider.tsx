import { ReactNode } from 'react'

import './Divider.css'

interface DividerProps {
  /**
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'

  children?: ReactNode
}

export const Divider = ({
  orientation = 'horizontal',
  children,
}: DividerProps) => {
  return (
    <div className="divider" role="separator" aria-orientation={orientation}>
      <div className="divider__separator" />
      {children && <span className="divider__text subhead1-r">{children}</span>}
      <div className="divider__separator" />
    </div>
  )
}
