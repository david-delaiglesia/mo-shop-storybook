const ListHeartImage = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      {...props}
    >
      <path
        fill="url(#a)"
        d="M5.459 7.268A4 4 0 0 1 9.126 3.76l2.863-.218a92 92 0 0 1 13.978 0l2.863.218a4 4 0 0 1 3.667 3.508l.145 1.193a91.997 91.997 0 0 1 0 22.097l-.145 1.193a4 4 0 0 1-3.667 3.508l-2.863.218a91.999 91.999 0 0 1-13.978 0l-2.863-.218a4 4 0 0 1-3.667-3.508l-.144-1.193a92 92 0 0 1 0-22.097l.144-1.193Z"
      />
      <path
        fill="url(#b)"
        fillOpacity=".3"
        d="M16.326 23.899c0 .27-.22.49-.49.49H9.673a.49.49 0 0 1-.49-.49V22.45c0-.27.22-.49.49-.49h6.163c.27 0 .49.22.49.49v1.448Zm3.572-5.879c0 .27-.22.49-.49.49H9.673a.49.49 0 0 1-.49-.49v-1.448c0-.27.22-.49.49-.49h9.735c.27 0 .49.22.49.49v1.448Zm7.857-5.876c0 .27-.22.49-.49.49H9.673a.49.49 0 0 1-.49-.49v-1.45c0-.27.22-.489.49-.489h17.592c.27 0 .49.22.49.49v1.449Z"
      />
      <mask
        id="d"
        width="30"
        height="33"
        x="4"
        y="3"
        maskUnits="userSpaceOnUse"
        style={{ maskType: 'alpha' }}
      >
        <path
          fill="url(#c)"
          d="M5.46 7.268A4 4 0 0 1 9.127 3.76l2.863-.218a92.001 92.001 0 0 1 13.978 0l2.863.218a4 4 0 0 1 3.667 3.508l.145 1.193a91.997 91.997 0 0 1 0 22.097l-.145 1.193a4 4 0 0 1-3.667 3.508l-2.863.218a92 92 0 0 1-13.978 0l-2.863-.218a4 4 0 0 1-3.667-3.508l-.144-1.193a92 92 0 0 1 0-22.097l.144-1.193Z"
        />
      </mask>
      <g filter="url(#e)" mask="url(#d)">
        <path
          fill="#000"
          fillOpacity=".4"
          d="M29.293 36.658c17.649-12.051 5.755-22.16 0-15.55-5.756-6.61-17.65 3.499 0 15.55Z"
        />
      </g>
      <path
        fill="url(#f)"
        d="M29.292 36.658c17.65-12.051 5.755-22.16 0-15.55-5.755-6.61-17.65 3.499 0 15.55Z"
      />
      <defs>
        <linearGradient
          id="a"
          x1="32.478"
          x2="18.288"
          y1="40.51"
          y2="17.58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D7D7D7" />
          <stop offset="1" stopColor="#F3F3F3" />
        </linearGradient>
        <linearGradient
          id="b"
          x1="9.184"
          x2="27.794"
          y1="17.307"
          y2="17.307"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#767676" stopOpacity=".8" />
          <stop offset="1" stopColor="#767676" />
        </linearGradient>
        <linearGradient
          id="c"
          x1="32.479"
          x2="18.289"
          y1="40.51"
          y2="17.58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D7D7D7" />
          <stop offset="1" stopColor="#F3F3F3" />
        </linearGradient>
        <linearGradient
          id="f"
          x1="20.768"
          x2="29.794"
          y1="19.886"
          y2="36.672"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F08585" />
          <stop offset="1" stopColor="#E03333" />
        </linearGradient>
        <filter
          id="e"
          width="38.011"
          height="37.082"
          x="10.287"
          y="9.296"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_7549_23120"
            stdDeviation="4.86"
          />
        </filter>
      </defs>
    </svg>
  )
}

export { ListHeartImage }
