let grecaptchaInstance = null

export const Recaptcha = {
  async init() {
    grecaptchaInstance = await this.getInstance()
    hideBadge()
    return grecaptchaInstance
  },

  getInstance() {
    if (grecaptchaInstance) {
      return grecaptchaInstance
    }
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.id = 'google-recaptcha'
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${
        import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY
      }`
      script.async = 1
      script.onload = () => {
        window.grecaptcha.enterprise.ready(() => {
          resolve(window.grecaptcha.enterprise)
        })
      }
      document.body.appendChild(script)
    })
  },

  async getLoginToken() {
    if (!grecaptchaInstance) {
      await this.init()
    }

    const token = grecaptchaInstance.execute(
      import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY,
      {
        action: 'login',
      },
    )

    return token
  },

  cleanup() {
    cleanupScript()
    cleanupGlobalVariables()
    cleanupBadge()
    grecaptchaInstance = null
  },
}

function cleanupScript() {
  const script = document.querySelector('#google-recaptcha')
  if (script) {
    script.remove()
  }
}

function cleanupGlobalVariables() {
  if (!window.grecaptcha) return
  if (!window.___grecaptcha_cfg) return

  delete window.grecaptcha
  delete window.___grecaptcha_cfg
}

function cleanupBadge() {
  const badgeNode = document.querySelector('.grecaptcha-badge')
  if (badgeNode && badgeNode.parentNode) {
    badgeNode.parentNode.remove()
  }
}

function hideBadge() {
  const badgeNode = document.querySelector('.grecaptcha-badge')
  if (badgeNode && badgeNode.parentNode) {
    badgeNode.parentNode.setAttribute('style', 'display:none')
  }
}
