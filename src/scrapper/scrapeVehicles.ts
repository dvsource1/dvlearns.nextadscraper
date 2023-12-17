import { BaseScraped, Scraped, ScrapedVehicle } from 'dvlearns/@types/scraped'
import { toDateString } from 'dvlearns/utils/date-utils'
import scrapeRiyasewana from './sources/scrapeRiyasewanaCOM'
import scrapeIkman from './sources/scrapeIkmanLK'

const scrapeVehicles = async (
  baseURLs: string[],
  ignoreIndividuals = false
): Promise<BaseScraped<ScrapedVehicle>> => {
  const [riyasewanaURL, ikmanURL] = baseURLs

  const riyasewanaScraped: Scraped<ScrapedVehicle> = await scrapeRiyasewana(
    riyasewanaURL,
    ignoreIndividuals
  )
  const ikmanScraped: Scraped<ScrapedVehicle> = await scrapeIkman(
    ikmanURL,
    ignoreIndividuals
  )

  return {
    results: [...riyasewanaScraped.results, ...ikmanScraped.results],
    count: riyasewanaScraped.count + ikmanScraped.count,
    timestamp: toDateString(new Date()),
  }
}

export default scrapeVehicles
