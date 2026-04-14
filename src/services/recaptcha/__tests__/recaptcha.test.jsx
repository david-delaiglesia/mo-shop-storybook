import { fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'

import { Recaptcha } from '..'
import userEvent from '@testing-library/user-event'

describe('Recaptcha Service', () => {
  afterEach(() => {
    const script = document.querySelector('script')
    if (script) script.remove()
    Recaptcha.cleanup()
    vi.clearAllMocks()
  })

  it('appends the reCAPTCHA script to the body', async () => {
    const App = () => {
      useEffect(() => {
        Recaptcha.init()
      }, [])
      return <p>Test Component</p>
    }
    render(<App />)

    const script = document.querySelector('#google-recaptcha')
    expect(script.src).toBe(
      `https://www.google.com/recaptcha/enterprise.js?render=${
        import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY
      }`,
    )
  })

  it('initialises the reCAPTCHA client', async () => {
    const readyMock = vi.fn((cb) => cb())

    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
      },
    }

    const App = () => {
      useEffect(() => {
        Recaptcha.init()
      }, [])
      return <p>Test Component</p>
    }
    render(<App />)

    const script = document.querySelector('#google-recaptcha')
    fireEvent.load(script)

    expect(readyMock).toHaveBeenCalledTimes(1)
  })

  it('retrieves a login token from reCAPTCHA', async () => {
    const readyMock = vi.fn((cb) => cb())
    const executeMock = vi.fn()

    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
        execute: executeMock,
      },
    }

    const GetTokenButton = () => {
      useEffect(() => {
        Recaptcha.init()
      }, [])

      return (
        <button
          onClick={() => {
            Recaptcha.getLoginToken()
          }}
        >
          Get Token
        </button>
      )
    }

    render(<GetTokenButton />)

    const script = document.querySelector('#google-recaptcha')
    fireEvent.load(script)

    const button = await screen.findByRole('button', { name: 'Get Token' })
    userEvent.click(button)

    expect(executeMock).toHaveBeenCalledWith(
      import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY,
      {
        action: 'login',
      },
    )
  })

  it('removes the reCAPTCHA script and badge from the document on component dismount', async () => {
    const readyMock = vi.fn((cb) => cb())
    const executeMock = vi.fn()

    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
        execute: executeMock,
      },
    }

    window.___grecaptcha_cfg = { pid: 'abc' }

    const App = () => {
      useEffect(() => {
        Recaptcha.init()
        return Recaptcha.cleanup
      }, [])
      return <p>Test Component</p>
    }

    const { unmount } = render(<App />)

    await screen.findByText('Test Component')
    const script = document.querySelector('#google-recaptcha')
    fireEvent.load(script)

    unmount()

    const scriptNode = document.querySelector('#google-recaptcha')
    expect(scriptNode).toBeNull()
    expect(window.grecaptcha).toBeUndefined()
    expect(window.___grecaptcha_cfg).toBeUndefined()
  })

  it('initialises the service when trying to get a token but init has not happened yet', async () => {
    const executeMock = vi.fn()

    Recaptcha.getInstance = vi.fn().mockResolvedValue({
      execute: executeMock,
    })

    const GetTokenButton = () => {
      return (
        <button onClick={() => Recaptcha.getLoginToken()}>Get Token</button>
      )
    }

    render(<GetTokenButton />)

    const button = await screen.findByRole('button', { name: 'Get Token' })
    userEvent.click(button)

    await screen.findByRole('button', { name: 'Get Token' })

    expect(executeMock).toHaveBeenCalledWith(
      import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY,
      {
        action: 'login',
      },
    )
  })
})
