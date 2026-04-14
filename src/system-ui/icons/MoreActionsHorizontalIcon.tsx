import { SVGProps } from 'react'

interface MoreActionsHorizontalIconProps extends SVGProps<SVGSVGElement> {
  size: number
}

export const MoreActionsHorizontalIcon = ({
  size,
  ...props
}: MoreActionsHorizontalIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.75 8.389a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm5 0a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm3.25 1.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"
      fill="currentColor"
    />
  </svg>
)
