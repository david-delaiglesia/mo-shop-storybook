import { SVGProps } from 'react'

interface DocumentIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const Document = ({ size = 24, ...props }: DocumentIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7.04658 22C5.11561 22 4.15479 21.0299 4.15479 19.0802V4.9291C4.15479 2.98881 5.12493 2 7.04658 2H11.3283V8.84701C11.3283 10.041 11.8973 10.6101 13.0914 10.6101H19.8451V19.0802C19.8451 21.0205 18.8843 22 16.9533 22H7.04658ZM13.1193 9.33209C12.7742 9.33209 12.6063 9.16418 12.6063 8.82836V2.10261C12.9981 2.16791 13.3805 2.43843 13.819 2.88619L18.9589 8.1194C19.4067 8.57649 19.6772 8.94963 19.7331 9.33209H13.1193Z"
      fill="currentColor"
    />
  </svg>
)
