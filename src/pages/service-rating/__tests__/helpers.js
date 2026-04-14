import { fireEvent, screen } from '@testing-library/react'

const sendRate = () => {
  fireEvent.click(screen.getByText('Send'))
}

const finishServiceRating = () => {
  fireEvent.click(screen.getByText('Ok'))
}

const fillRatingMessage = (message) => {
  const event = { target: { name: 'email', value: message } }
  fireEvent.change(screen.getByLabelText('Lo que más me gustó es…'), event)
}

const openACMOChat = () => {
  fireEvent.click(screen.getByText('Start chat with customer support'))
}

const selectMood = (mood) => {
  fireEvent.click(screen.getByLabelText(mood))
}

const selectChoice = (choice) => {
  fireEvent.click(screen.getByText(choice))
}

const goToPreviousStep = () => {
  fireEvent.click(screen.getByText('Back'))
}

export {
  sendRate,
  finishServiceRating,
  fillRatingMessage,
  openACMOChat,
  selectMood,
  selectChoice,
  goToPreviousStep,
}
