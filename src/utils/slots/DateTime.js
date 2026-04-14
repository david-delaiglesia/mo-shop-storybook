const isoLocal = 'es-ES'
const hourConfig = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

const parseDate = (date) => {
  return new Date(date)
}

const getFormattedTime = (date, timeZone = 'Europe/Madrid') => {
  if (!date) return

  const options = {
    ...hourConfig,
    timeZone: timeZone,
  }

  const formattedTime = parseDate(date).toLocaleTimeString(isoLocal, options)
  return formattedTime
}

const getTimePlusOneMinute = (date, timeZone = 'Europe/Madrid') => {
  if (!date) return

  const parsedDate = parseDate(date)
  parsedDate.setMinutes(parsedDate.getMinutes() + 1)

  return getFormattedTime(parsedDate, timeZone)
}

export const DateTime = {
  getFormattedTime,
  getTimePlusOneMinute,
}
