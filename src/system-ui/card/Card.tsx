import { ElementType } from 'react'

import classNames from 'classnames'

import { PolymorphicProps } from 'system-ui/types'

import './Card.css'

type CardProps<AsElementType extends ElementType = 'div'> =
  PolymorphicProps<AsElementType> & {
    /**
     * @default false
     */
    hover?: boolean
  }

export const Card = <AsElementType extends ElementType = 'div'>({
  as: TagName = 'div',
  children,
  className,
  hover = false,
  ...props
}: CardProps<AsElementType>) => (
  <TagName
    className={classNames('card', className, hover && 'card--hover')}
    {...props}
  >
    {children}
  </TagName>
)
