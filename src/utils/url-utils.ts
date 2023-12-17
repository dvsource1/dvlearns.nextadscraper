export const getQueryParams = (url: string): Record<string, string> => {
  const urlO = new URL(url)
  const params = new URLSearchParams(urlO.search)
  const entries = params.entries()
  const result: Record<string, string> = {}

  for (const [key, value] of entries) {
    result[key] = value
  }

  return result
}

export const getQueryParam = (url: string, key: string): string => {
  return getQueryParams(url)[key]
}

export const getProtocol = (url: string): string => {
  const urlO = new URL(url)
  return urlO.protocol
}

export const updateQueryParam = (
  url: string,
  key: string,
  value: string
): string => {
  const urlO = new URL(url)
  urlO.searchParams.set(key, value)
  return urlO.toString()
}
