type ValueOf<T> = T[keyof T]

declare module '@mercadona/mo.library.shop-ui/modal' {
  export enum ModalSize {
    SMALL = 'small',
    SMALL_ALIGN_LEFT = 'small-align-left',
    MEDIUM = 'medium',
    LARGE = 'large',
    STICKY = 'sticky',
  }

  export enum ModalMood {
    POSITIVE = 'positive',
    DESTRUCTIVE = 'destructive',
  }

  export interface ModalProps {
    onClose: () => void
    className?: string
    children?: React.ReactNode
    size: ValueOf<ModalSize>
    title: React.ReactNode
    description?: string
    showClose?: boolean
    closeOnEscape?: boolean

    imageSrc?: string
    imageAlt?: string

    /**
     * @default ModalMood.POSITIVE
     */
    mood?: ValueOf<ModalMood>
    primaryActionText?: string
    onPrimaryAction?: () => void
    primaryActionLoading?: boolean
    secondaryActionText?: string
    onSecondaryAction?: () => void
  }

  export const Modal: {
    (props: ModalProps): JSX.Element
  }

  export const ModalsProvider: {
    (props: {
      children: React.ReactNode
      closeActionLabel: string
    }): JSX.Element
  }

  export interface ModalLegacyProps {
    title: string
    closeAriaLabelText?: string
    description?: string
    imageSrc?: string
    imageAlt?: string
    primaryActionText: string
    primaryAction?: () => void
    secondaryActionText?: string
    secondaryAction?: () => void
    hideModal: () => void
    loadingText?: string
    disabled?: boolean
    children?: React.ReactNode
    mood?: 'positive' | 'destructive'
  }

  /**
   * @deprecated Use Modal component instead
   */
  export const MediumModal: {
    (props: ModalLegacyProps): JSX.Element
  }

  /**
   * @deprecated Use Modal component instead
   */
  export const SmallModal: {
    (props: ModalLegacyProps): JSX.Element
  }
}

declare module '@mercadona/mo.library.shop-ui/button' {
  enum ButtonSize {
    SMALL = 'small',
    DEFAULT = 'default',
    BIG = 'big',
  }

  enum ButtonVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    QUATERNARY = 'quaternary',
    TEXT = 'text',
  }

  enum ButtonMood {
    POSITIVE = 'positive',
    NEUTRAL = 'neutral',
    DESTRUCTIVE = 'destructive',
  }

  enum ButtonIconPosition {
    START = 'start',
    END = 'end',
  }
  export interface ButtonProps extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
    variant?: ValueOf<ButtonVariant>
    size?: ValueOf<ButtonSize>
    fullWidth?: boolean
    loading?: boolean
    handleLoading?: boolean
    loadingText?: string
    mood?: ValueOf<ButtonMood>
    icon?:
      | string
      | React.FC<
          Omit<React.SVGProps<SVGSVGElement>, 'height' | 'width'> & {
            size: number
          }
        >
    iconPosition?: ValueOf<ButtonIconPosition>
  }

  export const Button: {
    (props: ButtonProps): JSX.Element
  }
}

declare module '@mercadona/mo.library.shop-ui/icon' {
  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    icon: string
    /**
     * @default 'current-color'
     */
    color?:
      | 'current-color'
      | 'black'
      | 'white'
      | 'cucumber'
      | 'egg'
      | 'orange'
      | 'blueberry'
      | 'chocolat'
      | 'tomato'
  }

  export const Icon: {
    (props: IconProps): JSX.Element
  }
}

declare module '@mercadona/mo.library.shop-ui/notifier' {
  enum NotifierType {
    INFO = 'info',
    ALERT = 'alert',
  }

  enum NotifierVariant {
    INLINE = 'inline',
    BLOCK = 'block',
  }

  interface NotifierBaseProps extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
    /**
     * @default NotifierType.INFO
     */
    type?: ValueOf<NotifierType>
    /**
     * @default NotifierVariant.INLINE
     */
    variant?: ValueOf<NotifierVariant>
    icon?: string
  }

  interface NotifierWithAction extends NotifierBaseProps {
    onActionClick: () => void
    actionText: string
  }

  interface NotifierWithoutAction extends NotifierBaseProps {
    onActionClick?: never
    actionText?: never
  }

  export type NotifierProps = NotifierWithAction | NotifierWithoutAction

  export const Notifier: {
    (props: NotifierProps): JSX.Element
  }
}

declare module '@mercadona/mo.library.shop-ui/loader' {
  export interface LoaderProps {
    className?: string
    ariaLabel?: string
  }

  export const Loader: {
    (props: LoaderProps): JSX.Element
  }
}

declare module '@mercadona/mo.library.shop-ui/layouts' {
  export interface BoxedLayoutProps {
    /**
     * @default '0px'
     */
    marginTop?: string
    backgroundColor?: string
    children: {
      sidebar?: React.ReactNode
      content: React.ReactNode
      footer: React.ReactNode
    }
  }

  export const BoxedLayout: {
    (props: BoxedLayoutProps): JSX.Element
  }
}

declare module '@mercadona/mo.library.shop-ui/card' {
  enum CardStatus {
    INACTIVE = 'inactive',
    ENABLED = 'enabled',
    ACTIVE = 'active',
  }

  export interface CardProps
    extends React.HTMLAttributes<HTMLElement>, React.AriaAttributes {
    as?: keyof JSX.IntrinsicElements
    /**
     * @default 3
     */
    padding?: 0 | 1 | 2 | 3 | 4 | 5
    /**
     * @default false
     */
    hover?: boolean
    /**
     * @default CardStatus.ENABLED
     */
    status?: ValueOf<CardStatus>
  }

  export const Card: {
    (props: CardProps): JSX.Element
  }
}

declare module '@mercadona/mo.library.shop-ui/blank-layout' {
  export interface BlankLayoutProps {
    paddingTop?: string
    children: {
      content: React.ReactNode
      footer: React.ReactNode
    }
  }

  export const BlankLayout: {
    (props: BlankLayoutProps): JSX.Element
  }
}
