import myRegularsImage from './assets/my-regulars-copy@2x.png'
import { func, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { TAB_INDEX } from 'utils/constants'

import './styles/MyRegularsEmpty.css'

const MyRegularsEmpty = ({ buttonText, redirect, title, messageText }) => {
  return (
    <div className="my-regulars-empty">
      <div className="my-regulars-empty__content">
        <img
          alt=""
          src={myRegularsImage}
          className="my-regulars-empty__image"
        />
        <FocusedElementWithInitialFocus>
          <h4 className="title2-b my-regulars-empty__title">{title}</h4>
        </FocusedElementWithInitialFocus>
        <p
          tabIndex={TAB_INDEX.ENABLED}
          className="body1-r my-regulars-empty__message"
        >
          {messageText}
        </p>
        {buttonText && (
          <Button variant="secondary" onClick={redirect}>
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  )
}

MyRegularsEmpty.propTypes = {
  buttonText: string,
  redirect: func,
  title: string.isRequired,
  messageText: string.isRequired,
}

export { MyRegularsEmpty }
