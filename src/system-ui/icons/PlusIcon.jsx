import PropTypes from 'prop-types'

export const PlusIcon = ({ size = 32 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
  >
    <rect
      width={size}
      height={size}
      x=".5"
      fill="#00AB61"
      fillOpacity=".1"
      rx="16"
    />
    <path
      fill="#00AB61"
      fillOpacity=".7"
      fillRule="evenodd"
      d="M16.5 8c-.69 0-1.25.56-1.25 1.25v5.5h-5.5a1.25 1.25 0 1 0 0 2.5h5.5v5.5a1.25 1.25 0 1 0 2.5 0v-5.5h5.5a1.25 1.25 0 1 0 0-2.5h-5.5v-5.5c0-.69-.56-1.25-1.25-1.25Z"
      clipRule="evenodd"
    />
  </svg>
)

PlusIcon.propTypes = {
  size: PropTypes.number,
}
