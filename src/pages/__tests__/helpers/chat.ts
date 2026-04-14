import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const sendFileToHelDeskChat = (file: File) => {
  userEvent.upload(screen.getByLabelText('Attach images or files'), file)
}

export const openChatFromUserMenu = () => {
  const helpHeaderButton = within(screen.getByRole('listbox')).getByRole(
    'button',
    { name: 'Help' },
  )

  userEvent.click(helpHeaderButton)
}

export const openChatFromLogin = () => {
  const helpHeaderButton = within(screen.getByRole('dialog')).getByRole(
    'button',
    { name: 'Help' },
  )

  userEvent.click(helpHeaderButton)
}

export const openChatFromHelp = () => {
  const helpButton = screen.getByRole('button', { name: 'Help' })

  userEvent.click(helpButton)
}

export const openChatFromOrderWidget = (label: string) => {
  const orderWidget = screen.getByRole('listitem', { name: label })

  userEvent.click(within(orderWidget).getByRole('button', { name: 'Chat' }))
}

export const startNewChat = () => {
  const chat = screen.getByLabelText('Customer service')

  userEvent.click(within(chat).getByRole('button', { name: 'Start new chat' }))
}

export const retryStartNewChat = () => {
  const chat = screen.getByLabelText('Customer service')

  userEvent.click(within(chat).getByRole('button', { name: 'Try again' }))
}
