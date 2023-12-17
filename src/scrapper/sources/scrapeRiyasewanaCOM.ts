import axios from 'axios'
import * as cheerio from 'cheerio'

import {
  Scraped,
  ScrapedVehicle,
  ScrapedVehicleExtra,
  ScrapedVehicleOwner,
} from 'dvlearns/@types/scraped'
import {
  toNumberOrNull,
  toNumberOrText,
  toTextOrEmpty,
  toTextOrNull,
  toTextWithouterEscapeChars,
} from 'dvlearns/utils'
import { toDateString, toISODate } from 'dvlearns/utils/date-utils'
import { getProtocol, getQueryParam } from 'dvlearns/utils/url-utils'

const scrapeRiyasewana = async (
  baseURL: string,
  ignoreIndividuals = false
): Promise<Scraped<ScrapedVehicle>> => {
  const results: ScrapedVehicle[] = []
  let timestamp = toDateString(new Date())

  try {
    const classifieds = await scrapeRiyasewanaResults(
      baseURL,
      ignoreIndividuals
    )
    results.push(...classifieds)
  } catch (error) {
    console.error(error)
    throw error
  }

  return {
    source: 'riyasewana',
    baseURL,
    results,
    count: results.length,
    timestamp,
  } as Scraped<ScrapedVehicle>
}

const scrapeRiyasewanaResults = async (
  baseURL: string,
  ignoreIndividuals = false
): Promise<ScrapedVehicle[]> => {
  const classifieds: ScrapedVehicle[] = []

  try {
    const response = await axios.get(baseURL)
    const $ = cheerio.load(response.data)

    const firstScraped = await scrapeRiyasewanaResultPage(
      baseURL,
      ignoreIndividuals,
      $
    )
    classifieds.push(...firstScraped)

    const paginationLinks = $('div.pagination a')
      .map((_, element) => $(element).attr('href'))
      .get()
      .filter((href) => href !== undefined)

    const paginationLinksSet = new Set(paginationLinks)
    const protocol = getProtocol(baseURL)

    for (const paginationLink of paginationLinksSet) {
      const restScraped = await scrapeRiyasewanaResultPage(
        `${protocol}${paginationLink}`,
        ignoreIndividuals
      )
      classifieds.push(...restScraped)
    }
  } catch (error) {
    console.error(error)
    throw error
  }

  return classifieds
}

const scrapeRiyasewanaResultPage = async (
  baseURL: string,
  ignoreIndividuals = false,
  cheerioRoot: cheerio.Root | undefined = undefined
): Promise<ScrapedVehicle[]> => {
  const classifieds: any[] = []

  try {
    let $: cheerio.Root | undefined = cheerioRoot
    let pageId = 1
    if (!$) {
      const pageQueryParam = getQueryParam(baseURL, 'page')
      pageId = pageQueryParam ? parseInt(pageQueryParam) : 1

      const response = await axios.get(baseURL)
      $ = cheerio.load(response.data)
    }

    const liElements = $('li.item')
    const protocol = getProtocol(baseURL)
    for (const liElement of liElements) {
      const individualURL = toTextOrNull($(liElement).find('a').attr('href'))
      const summary = toTextWithouterEscapeChars($(liElement).text())

      const title = toTextOrEmpty($(liElement).find('h2.more a').text())
      const imageURL = `${protocol}${toTextOrNull(
        $(liElement).find('img').attr('src')
      )}`
      const location = toTextOrEmpty(
        $(liElement).find('div.boxtext div.boxintxt').first().text()
      )
      const price = toNumberOrText(
        $(liElement).find('div.boxtext div.boxintxt.b').text()
      )
      const mileage = toNumberOrNull(
        $(liElement).find('div.boxtext div.boxintxt').eq(2).text()
      )
      const date = toTextOrEmpty(
        $(liElement).find('div.boxtext div.boxintxt.s').text()
      )
      const isoDate = toISODate(date)
      const vehicle: Partial<ScrapedVehicle> = {
        title,
        summary,
        price,
        date: isoDate,
        extra: { mileage },
        owner: { location },
        __META__: {
          source: 'riyasewana',
          sourceURL: baseURL,
          individualURL,
          imageURL,
          timestamp: toDateString(new Date()),
          pageId,
        },
      }

      if (individualURL && !ignoreIndividuals) {
        await scrapeRiyasewanaIndividual(individualURL, vehicle)
      }

      classifieds.push(vehicle)
    }
  } catch (error) {
    console.error(error)
    throw error
  }

  return classifieds
}

const scrapeRiyasewanaIndividual = async (
  baseURL: string,
  vehicle: Partial<ScrapedVehicle> = {}
): Promise<void> => {
  try {
    const response = await axios.get(baseURL)
    const $ = cheerio.load(response.data)

    const subTitle = toTextOrEmpty($('h2').text())
    const regex = /Posted by (.*) on (.*), (.*)/g
    const matches = regex.exec(subTitle)
    const owner = toTextOrEmpty(matches ? matches[1] : '')
    const date = toTextOrEmpty(matches ? matches[2] : '')

    vehicle.date = toISODate(date, 'yyyy-MM-dd h:mm aa')
    vehicle.extra = {}

    const detailsTableRows = $('table.moret').find('tr')
    for (let i = 0; i < detailsTableRows.length; i++) {
      const row = detailsTableRows.eq(i)
      const rowCellsArray = Array.from(row.find('td'))
      const rowCellsArraySplit = [
        rowCellsArray.slice(0, 2),
        rowCellsArray.slice(2),
      ]

      let contact = vehicle.owner?.contacts?.[0]?.phone
      let location = vehicle.owner?.location

      let mileage = vehicle.extra?.mileage
      let make = vehicle.extra?.make
      let model = vehicle.extra?.model
      let year = vehicle.extra?.year || null
      let transmission = vehicle.extra?.transmission
      let fuelType = vehicle.extra?.fuelType
      let engineCapacity = vehicle.extra?.engineCapacity || null
      let options = vehicle.extra?.options

      for (const cellsPair of rowCellsArraySplit) {
        const key = toTextOrEmpty($(cellsPair[0]).text())
        const value = toTextOrEmpty($(cellsPair[1]).text())

        if (key === 'Contact') {
          contact = toNumberOrNull(value)
        } else if (key === 'Make') {
          make = value
        } else if (key === 'Model') {
          model = value
        } else if (key === 'YOM') {
          year = toNumberOrNull(value)
        } else if (key === 'Mileage (km)') {
          mileage = toNumberOrNull(value)
        } else if (key === 'Gear') {
          transmission = value
        } else if (key === 'Fuel Type') {
          fuelType = value
        } else if (key === 'Engine (cc)') {
          engineCapacity = toNumberOrNull(value)
        } else if (key === 'Options') {
          options = value ? value.split(', ') : []
        } else if (key === 'Price') {
          vehicle.price = toNumberOrText(value)
        } else if (key === 'Details') {
          vehicle.description = value
        }
      }

      vehicle.owner = {
        name: owner,
        contacts: [{ phone: contact, verified: true }],
        company: '',
        location,
      } as ScrapedVehicleOwner

      vehicle.extra = {
        mileage,
        make,
        model,
        year,
        transmission,
        fuelType,
        engineCapacity,
        options,
      } as ScrapedVehicleExtra
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default scrapeRiyasewana
