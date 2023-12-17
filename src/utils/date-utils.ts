import parse from 'date-fns/parse'

import { DEFAULT_DATE_FORMAT } from './constants'

export const toJSDate = (date: string, format = DEFAULT_DATE_FORMAT): Date => {
  return parse(date, format, new Date())
}

export const toISODate = (
  date: string,
  format = DEFAULT_DATE_FORMAT
): string | null => {
  return toDateString(toJSDate(date, format))
}

export const toDateString = (date: Date): string | null => {
  if (!date) return null

  return date.toISOString()
}

export const getBeforeDate = (date: Date, seconds: number) => {
  return new Date(date.getTime() - seconds * 1000)
}

export type Timestamp = `${number} ${'minutes' | 'hours' | 'days'}` | string

export const getSeconds = (timestamp: Timestamp | null): number => {
  if (!timestamp) return 0

  const [value, unit] = timestamp.split(' ')

  const seconds: { [key: string]: number } = {
    minutes: 60,
    hours: 60 * 60,
    days: 60 * 60 * 24,
  }

  const multipleFactor = seconds[unit]
  if (!multipleFactor) return 0

  return parseInt(value) * multipleFactor
}
