import PropTypes from 'prop-types'

export const InfoIcon = ({ size, ...props }) => (
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
      d="M8 0C3.58172 0 0 3.58172 0 8C0 10.1217 0.842855 12.1566 2.34315 13.6569C3.84344 15.1571 5.87827 16 8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0ZM6 12.5C6 12.7761 6.22386 13 6.5 13H9.5C9.77614 13 10 12.7761 10 12.5C10 12.2239 9.77614 12 9.5 12H9V6H6.5C6.22386 6 6 6.22386 6 6.5C6 6.77614 6.22386 7 6.5 7H7V12H6.5C6.22386 12 6 12.2239 6 12.5ZM7.75 5C7.05964 5 6.5 4.44036 6.5 3.75C6.5 3.05964 7.05964 2.5 7.75 2.5C8.44036 2.5 9 3.05964 9 3.75C9 4.44036 8.44036 5 7.75 5Z"
      fill="currentColor"
    />
  </svg>
)

InfoIcon.propTypes = {
  size: PropTypes.number.isRequired,
}
