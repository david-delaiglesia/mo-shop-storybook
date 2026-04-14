let events = {
  onView: () => null,
  onConfirm: () => null,
}

const setEvents = (overrideEvents) => {
  events = { ...events, ...overrideEvents }
}

const activate = (events) => {
  setEvents(events)
  window.addEventListener('beforeunload', beforeUnloadEvent)
  window.addEventListener('unload', unload)
}

const deactivate = () => {
  window.removeEventListener('beforeunload', beforeUnloadEvent)
  window.removeEventListener('unload', unload)
}

const beforeUnloadEvent = (event) => {
  events.onView()
  event.returnValue = 'default'
}

const unload = () => {
  events.onConfirm()
}

export const SystemAlert = {
  activate,
  deactivate,
}
