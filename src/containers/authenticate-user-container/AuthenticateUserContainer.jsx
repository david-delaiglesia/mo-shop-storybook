import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import PropTypes from 'prop-types'

import { RecaptchaTerms } from 'app/authentication/components/recaptcha-terms'
import { LoginContainer } from 'app/authentication/containers/login-container'
import { sendAuthViewMetrics } from 'app/authentication/metrics'
import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatHelpSources } from 'app/chat/metrics'
import { CheckUserContainer } from 'containers/check-user-container'
import { SignUpContainer } from 'containers/sign-up-container'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Support } from 'services/support'

const CHILD_TYPES = {
  CHECK_USER: 'CHECK_USER',
  SIGN_UP: 'SIGN_UP',
  LOGIN: 'LOGIN',
}

function AuthenticateUserContainer({
  close,
  checkUserComponent,
  signUpComponent,
  loginComponent,
  passwordRecoveryComponent,
  isBeingAuthorizedFromCheckout,
}) {
  const { t } = useTranslation()
  const [activeChild, setActiveChild] = useState(CHILD_TYPES.CHECK_USER)
  const [email, setEmail] = useState('')
  const isActiveNewChat = useFlag(knownFeatureFlags.NEW_SUPPORT_CHAT)
  const chatContext = useChatContext()

  useEffect(() => {
    sendAuthViewMetrics()
  }, [])

  function getChildToRender() {
    const { CHECK_USER, SIGN_UP, LOGIN } = CHILD_TYPES

    const childTypes = {
      [CHECK_USER]: {
        component: CheckUserContainer,
        getProps: getCheckUserProps,
      },
      [SIGN_UP]: { component: SignUpContainer, getProps: getSignUpProps },
      [LOGIN]: { component: LoginContainer, getProps: getLoginProps },
    }

    return childTypes[activeChild]
  }

  function getCheckUserProps() {
    return {
      onCancel: close,
      onCheckUserSuccess: (email, accountExists) => {
        setEmail(email)

        if (!accountExists) {
          setActiveChild(CHILD_TYPES.SIGN_UP)
          return
        }

        setActiveChild(CHILD_TYPES.LOGIN)
      },
      checkUserComponent,
    }
  }

  function getSignUpProps() {
    return {
      email,
      goBack: () => setActiveChild(CHILD_TYPES.CHECK_USER),
      close,
      signUpComponent,
      isBeingAuthorizedFromCheckout,
    }
  }

  function getLoginProps() {
    return {
      email,
      isBeingAuthorizedFromCheckout,
      goBack: () => setActiveChild(CHILD_TYPES.CHECK_USER),
      close,
      loginComponent,
      passwordRecoveryComponent,
    }
  }

  const openSupportChat = () => {
    if (!isActiveNewChat) {
      Support.openWidget()
      return
    }

    chatContext?.open(ChatHelpSources.LOGIN)
  }

  const shouldRenderRecaptchaTerms = activeChild !== CHILD_TYPES.SIGN_UP

  const { component: ChildToRender, getProps } = getChildToRender()

  if (isBeingAuthorizedFromCheckout) {
    return (
      <>
        <div className="authenticate-user">
          <ChildToRender {...getProps()} />
          <button
            className="authenticate-user__help-link footnote1-r"
            onClick={openSupportChat}
          >
            {t('zendesk.need_help')}
          </button>
        </div>
        {shouldRenderRecaptchaTerms && (
          <div className="authenticate-user__recaptcha-terms">
            <RecaptchaTerms />
          </div>
        )}
      </>
    )
  }

  return (
    <div className="authenticate-user">
      <ChildToRender {...getProps()} />
      {shouldRenderRecaptchaTerms && <RecaptchaTerms />}
      <button
        className="authenticate-user__help-link footnote1-r"
        onClick={openSupportChat}
      >
        {t('zendesk.need_help')}
      </button>
    </div>
  )
}

AuthenticateUserContainer.propTypes = {
  checkUserComponent: PropTypes.func.isRequired,
  close: PropTypes.func,
  isBeingAuthorizedFromCheckout: PropTypes.bool,
  loginComponent: PropTypes.func.isRequired,
  passwordRecoveryComponent: PropTypes.func.isRequired,
  signUpComponent: PropTypes.func.isRequired,
}

AuthenticateUserContainer.defaultProps = {
  close: () => null,
  isBeingAuthorizedFromCheckout: false,
}

export { AuthenticateUserContainer }
