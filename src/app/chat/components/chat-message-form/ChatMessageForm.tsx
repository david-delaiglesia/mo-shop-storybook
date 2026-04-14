import { FormEvent, KeyboardEvent, RefObject, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatStatusType } from 'app/chat/interfaces'
import { useId } from 'hooks/useId'
import { LeftArrow28 } from 'system-ui/icons/28/LeftArrow28'

import './ChatMessageForm.css'

interface FormElements extends HTMLCollection {
  message: HTMLInputElement
}

interface ChatMessageFormProps {
  onInputMessageTabKeyDown: () => void
  onSubmitFile: (file: File) => void
  inputMessageRef: RefObject<HTMLInputElement>
}

export const ChatMessageForm = ({
  onInputMessageTabKeyDown,
  inputMessageRef,
  onSubmitFile,
}: ChatMessageFormProps) => {
  const { sendMessage, startNewChat, chatStatus } = useChatContext()
  const formId = useId()
  const fileFormId = useId()
  const [formIsValid, setFormIsValid] = useState(false)
  const { t } = useTranslation()

  const handleSubmitFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const form = event.currentTarget.form

    if (!form) return
    if (!file) return

    onSubmitFile(file)

    form.reset()
  }

  const handleFormChange = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    const input = form.querySelector(
      'input[name="message"]',
    ) as HTMLInputElement
    setFormIsValid(input.value.trim().length > 0)
  }

  const handleSubmitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const { message } = form.elements as FormElements

    sendMessage(message.value)
    form.reset()
    setFormIsValid(false)
  }

  if (chatStatus === ChatStatusType.FINISHED) {
    return (
      <footer className="chat-message-form--disabled">
        <Button
          fullWidth
          onClick={() => startNewChat()}
          className="chat-message-form__start"
        >
          {t('chat.message_form.start_new_conversation')}
        </Button>
      </footer>
    )
  }

  const handleMessageInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    const isTabForward = event.key === 'Tab' && !event.shiftKey
    if (!isTabForward) return
    event.preventDefault()

    onInputMessageTabKeyDown()
  }

  return (
    <footer
      className="chat-message-form"
      aria-label={t('chat.messages_forms.label')}
    >
      <form id={fileFormId}>
        <label className="chat-message-form__label chat-message-form__label--as-file-upload-button">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.8711 12.0935C18.0352 11.9353 18.2344 11.8504 18.4688 11.8387C18.7031 11.8269 18.8994 11.906 19.0576 12.076C19.2275 12.2342 19.3125 12.4392 19.3125 12.6912C19.3125 12.9373 19.2305 13.1394 19.0664 13.2976L12.5186 19.8455C11.9502 20.408 11.335 20.824 10.6729 21.0935C10.0107 21.3689 9.33398 21.5008 8.64258 21.489C7.95703 21.4832 7.29492 21.3426 6.65625 21.0672C6.01758 20.7976 5.44043 20.408 4.9248 19.8982C4.40918 19.3826 4.0166 18.8025 3.74707 18.158C3.47754 17.5193 3.33691 16.8572 3.3252 16.1717C3.31348 15.4861 3.44238 14.8123 3.71191 14.1502C3.9873 13.4881 4.40918 12.8728 4.97754 12.3045L13.9424 3.32206C14.5225 2.73612 15.1494 2.35233 15.8232 2.17069C16.4971 1.98905 17.1562 1.98612 17.8008 2.1619C18.4453 2.33768 19.0166 2.6746 19.5146 3.17264C20.0303 3.68827 20.373 4.26835 20.543 4.91288C20.7188 5.55155 20.71 6.20487 20.5166 6.87284C20.3291 7.53495 19.9453 8.15604 19.3652 8.73612L10.5498 17.5603C10.2217 17.8826 9.8584 18.0994 9.45996 18.2107C9.06152 18.3279 8.66309 18.3367 8.26465 18.2371C7.86621 18.1375 7.51172 17.9295 7.20117 17.6131C6.91406 17.326 6.71777 16.9832 6.6123 16.5848C6.5127 16.1863 6.51562 15.782 6.62109 15.3719C6.72656 14.9617 6.94043 14.5955 7.2627 14.2732L13.4062 8.13846C13.5703 7.96854 13.7637 7.88065 13.9863 7.87479C14.209 7.86893 14.4023 7.9451 14.5664 8.10331C14.7305 8.26737 14.8096 8.46073 14.8037 8.68339C14.7979 8.90018 14.71 9.09647 14.54 9.27225L8.42285 15.3719C8.24121 15.5535 8.16211 15.741 8.18555 15.9344C8.21484 16.1277 8.28809 16.2859 8.40527 16.409C8.53418 16.532 8.69238 16.6082 8.87988 16.6375C9.07324 16.6609 9.26074 16.5789 9.44238 16.3914L18.2139 7.61112C18.5244 7.30057 18.75 6.94901 18.8906 6.55643C19.0312 6.16385 19.0635 5.77421 18.9873 5.38749C18.917 5.00077 18.7266 4.64921 18.416 4.3328C18.1113 4.02225 17.7627 3.83182 17.3701 3.76151C16.9775 3.6912 16.585 3.72635 16.1924 3.86698C15.7998 4.00174 15.4482 4.2244 15.1377 4.53495L6.2168 13.4471C5.67773 13.992 5.32324 14.5808 5.15332 15.2137C4.98926 15.8406 4.99512 16.4558 5.1709 17.0594C5.35254 17.6629 5.67773 18.199 6.14648 18.6678C6.60938 19.1424 7.14258 19.4676 7.74609 19.6433C8.35547 19.8191 8.97363 19.825 9.60059 19.6609C10.2334 19.4969 10.8223 19.1424 11.3672 18.5974L17.8711 12.0935Z"
              fill="currentColor"
            />
          </svg>
          <input
            aria-label={t('chat.file_form.input.label')}
            onChange={handleSubmitFile}
            className="chat-message-form__file"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
          />
        </label>
      </form>

      <form
        className="chat-message-form__form"
        id={formId}
        onSubmit={handleSubmitMessage}
        onChange={handleFormChange}
      >
        <label
          className="chat-message-form__label chat-message-form__label--is-hidden"
          htmlFor="message"
        >
          {t('chat.message_form.label')}
        </label>
        <input
          ref={inputMessageRef}
          className="chat-message-form__input subhead1-r"
          name="message"
          id="message"
          placeholder={t('chat.message_form.input_placeholder')}
          autoComplete="off"
          autoFocus
          onKeyDown={handleMessageInputKeyDown}
        />
        <button
          disabled={!formIsValid}
          aria-label={t('chat.message_form.send_message_button')}
          className="chat-message-form__submit-button"
          type="submit"
        >
          <LeftArrow28 className="chat-message-form__submit-button-icon" />
        </button>
      </form>
    </footer>
  )
}
