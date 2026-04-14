import { string } from 'prop-types'

import './Skeleton.css'

const Skeleton = ({ width = '100%', height = '100%', ...props }) => {
  return (
    <div
      className="ui-skeleton"
      role="status"
      style={{ width, height }}
      {...props}
    ></div>
  )
}

Skeleton.propTypes = {
  width: string,
  height: string,
}

export { Skeleton }
