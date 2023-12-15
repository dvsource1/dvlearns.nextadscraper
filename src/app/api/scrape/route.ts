import axios from 'axios'
import * as cheerio from 'cheerio'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const baseURL = searchParams.get('baseURL')

  if (!baseURL) {
    return Response.json({
      error: 'Missing baseURL',
    })
  }
  const response = await axios.get(baseURL)
  const $ = cheerio.load(response.data)

  // get all the links
  const links = $('a')
    .map((i, el) => {
      const href = $(el).attr('href')
      const text = $(el).text()
      return { href, text }
    })
    .get()

  return Response.json({
    links,
  })
}
