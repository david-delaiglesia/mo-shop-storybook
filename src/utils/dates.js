import moment from 'moment-timezone'
import 'moment/dist/locale/ca'
import 'moment/dist/locale/es'
import 'moment/dist/locale/eu'

import { LANGUAGES } from 'utils/languages'

export const FIVE_MINUTES = 300000

moment.tz.setDefault('Europe/Madrid')

moment.defineLocale(LANGUAGES.VA, {
  parentLocale: LANGUAGES.CA,
})

moment.updateLocale('es', {
  weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
})

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

export function setMomentLocale(language) {
  moment.updateLocale(language, language)
}

export const getShortDayName = (date) =>
  moment(date).format('ddd').toUpperCase()

export const getLongDayName = (date) => moment(date).format('dddd')

export const getDay = (date, format = DEFAULT_DATE_FORMAT) =>
  moment(date).format(format)

export const getNumberDay = (date) => moment(date).format('D')

export const getStringMonthDay = (date) => moment(date).format('MMMM')

export const getShortMonthName = (date) => moment(date).format('MMM')

export const getToday = (format = DEFAULT_DATE_FORMAT) =>
  moment().format(format)

export const addDaysToDate = (
  numberOfDays,
  date,
  format = DEFAULT_DATE_FORMAT,
) => {
  return moment(date).add(numberOfDays, 'days').format(format)
}

export const sortDateDesc = (dateA, dateB) => {
  if (moment(dateA).isBefore(dateB)) {
    return 1
  }
  return -1
}

export const sortDateAsc = (dateA, dateB) => {
  if (moment(dateB).isBefore(dateA)) {
    return 1
  }
  return -1
}

export const getEnglishShortWeekDay = (date) =>
  moment(date).locale('en').format('ddd')

export const getWeekDayName = (date) => moment(date).format('dddd')

export const getWeekDayNameFromWeekNumberDay = (numberDay) =>
  moment().day(numberDay).format('dddd')

export const getTime = (date) => moment(date).format('H:mm')

export const getTimePlusOneMinute = (date) =>
  moment(date).add(1, 'minutes').format('H:mm')

export const isTheSameDate = (dateA, dateB) => moment(dateA).isSame(dateB)

export function getDiffDays(firstDay, lastDay) {
  return moment(lastDay).diff(firstDay, 'days')
}

export function getYearAndMonth(date) {
  return {
    year: getYear(date),
    month: getMonthNumber(date),
  }
}

export function getYear(date) {
  return moment(date).format('YYYY')
}

export const getMonthName = (date) => {
  return moment(date).format('MMMM')
}

function getMonthNumber(date) {
  return moment(date).format('MM')
}

export function getDiffDaysWithToday(day) {
  const startOfToday = moment().startOf('day')
  const startOfDay = moment(day).startOf('day')
  return getDiffDays(startOfToday, startOfDay)
}

export function isEqualOrGreater(date1, date2) {
  return moment(date1).isSameOrAfter(date2)
}

export const isSameDay = (date1, date2) => {
  return moment(date1).isSame(date2, 'day')
}

export const getTodayDate = () => moment()
