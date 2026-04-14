import { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from 'react'

export type PolymorphicProps<AsElement extends ElementType> = PropsWithChildren<
  ComponentPropsWithoutRef<AsElement> & {
    as?: AsElement
  }
>
