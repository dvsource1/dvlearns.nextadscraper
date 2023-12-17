export const toTextOrNull = (text: string | undefined): string | undefined => {
  if (!text) return ''
  if (typeof text !== 'string') return ''

  return text.trim()
}

export const toTextOrEmpty = (text: string): string => {
  return toTextOrNull(text) || ''
}

export const toTextWithouterEscapeChars = (text: string): string => {
  if (typeof text !== 'string') return ''

  return text.replace(/[\n\r\t]/g, '')
}

export const toNumberOrNull = (text: string): number | null => {
  if (!text) return null
  if (typeof text !== 'string') return null
  if (typeof text === 'number') return text

  const numbers = (text as string).match(/\d+/g)
  if (!numbers) return null

  const number = numbers.join('')
  if (!number) return null

  return parseInt(number)
}

export const toNumberOrText = (text: string): number | string => {
  return toNumberOrNull(text) || text
}
