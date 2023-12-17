import scrapeRiyasewana from 'dvlearns/scrapper/sources/scrapeRiyasewanaCOM'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const baseURL = searchParams.get('baseURL')

  if (!baseURL) {
    return Response.json({
      error: 'Missing baseURL',
    })
  }

  const vehicles = await scrapeRiyasewana(baseURL, true)

  return Response.json({
    vehicles,
  })
}
