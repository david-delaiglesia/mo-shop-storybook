import {
  IconComponentProps,
  IconComponentType,
} from '@mercadona/mo.library.icons'

export const CreditCardIcon: IconComponentType = ({
  size,
  ...props
}: IconComponentProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 33 32"
    width={size}
    height={size}
    {...props}
  >
    <g opacity=".86">
      <rect
        width="28.874"
        height="19.99"
        x="1.739"
        y="6.005"
        fill="#D9D9D9"
        rx="2.221"
      />
      <rect
        width="28.874"
        height="19.99"
        x="1.739"
        y="6.005"
        fill="url(#a)"
        rx="2.221"
      />
    </g>
    <path fill="url(#b)" d="M1.74 9.611h28.874v3.609H1.74z" />
    <path
      fill="#0D2950"
      fillOpacity=".2"
      d="M20.99 15.627h7.219v3.008H20.99z"
    />
    <defs>
      <radialGradient
        id="a"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="matrix(-17.61764 17.02683 -15.42317 -15.95833 23.798 7.861)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#DEEDF3" />
        <stop offset="1" stopColor="#95CAE0" />
      </radialGradient>
      <radialGradient
        id="b"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="rotate(166.2 12.761 5.21) scale(25.128 8.03924)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1F5EB6" />
        <stop offset=".994" stopColor="#0D2950" />
      </radialGradient>
    </defs>
  </svg>
)
