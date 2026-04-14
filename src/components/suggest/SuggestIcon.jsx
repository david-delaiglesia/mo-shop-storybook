import * as PropTypes from 'prop-types'

export const SuggestIcon = ({ size, ...props }) => (
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
      d="M9 8.87398C10.7252 8.42994 12 6.86384 12 5C12 2.79086 10.2091 1 8 1C5.79086 1 4 2.79086 4 5C4 6.86384 5.27477 8.42994 7 8.87398V14C7 14.5523 7.44772 15 8 15C8.55228 15 9 14.5523 9 14V8.87398ZM10 3C10 3.55228 9.55228 4 9 4C8.44772 4 8 3.55228 8 3C8 2.44772 8.44772 2 9 2C9.55228 2 10 2.44772 10 3Z"
      fill="currentColor"
    />
  </svg>
)

SuggestIcon.propTypes = {
  size: PropTypes.number.isRequired,
}
