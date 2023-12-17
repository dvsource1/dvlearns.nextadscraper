import axios from 'axios'
import * as cheerio from 'cheerio'

import {
  Ad,
  DetailAd,
  InitialData,
  PaginationData,
} from 'dvlearns/@types/ikman'

import { OwnerContact, Scraped, ScrapedVehicle } from 'dvlearns/@types/scraped'
import { toNumberOrNull, toNumberOrText } from 'dvlearns/utils'
import {
  getBeforeDate,
  getSeconds,
  toDateString,
} from 'dvlearns/utils/date-utils'
import { getQueryParam, updateQueryParam } from 'dvlearns/utils/url-utils'

const scrapeIkman = async (
  baseURL: string,
  ignoreIndividuals = false
): Promise<Scraped<ScrapedVehicle>> => {
  const results: ScrapedVehicle[] = []
  let timestamp = toDateString(new Date())

  try {
    const classifieds = await scrapeIkmanResults(baseURL, ignoreIndividuals)
    results.push(...classifieds)
  } catch (error) {
    console.error(error)
    throw error
  }

  return {
    source: 'ikman',
    baseURL,
    results,
    count: results.length,
    timestamp,
  } as Scraped<ScrapedVehicle>
}

const scrapeIkmanResults = async (
  baseURL: string,
  ignoreIndividuals = false
): Promise<ScrapedVehicle[]> => {
  const [firstClassifieds, pages]: [ScrapedVehicle[], number[] | null] =
    await scrapeIkmanResultPage(baseURL, ignoreIndividuals)

  const restClassifieds: ScrapedVehicle[] = []
  if (pages) {
    const [, ...restPages] = pages
    for (const page of restPages) {
      const pageURL = updateQueryParam(baseURL, 'page', page.toString())
      const [classifieds]: [ScrapedVehicle[], number[] | null] =
        await scrapeIkmanResultPage(pageURL, ignoreIndividuals)
      restClassifieds.push(...classifieds)
    }
  }

  return [...firstClassifieds, ...restClassifieds]
}

const scrapeIkmanResultPage = async (
  pageURL: string | undefined,
  ignoreIndividuals = false
): Promise<[ScrapedVehicle[], number[] | null]> => {
  const classifieds: any[] = []

  if (!pageURL) {
    return [classifieds, null]
  }

  let pages: number[] = []

  try {
    const response = await axios.get(pageURL)
    const $ = cheerio.load(response.data)

    const pageQueryParam = getQueryParam(pageURL, 'page')
    const pageId = pageQueryParam ? parseInt(pageQueryParam) : 1

    const initialData = getInitialData($)

    const ads = initialData?.serp?.ads?.data?.ads ?? []
    const paginationData = initialData?.serp?.ads?.data?.paginationData

    pages = getPages(paginationData)
    for (let i = 0; i < ads.length; i++) {
      const ad: Ad = ads[i] as Ad

      const dateDiff = getSeconds(ad.timeStamp)
      const individualURL = `https://ikman.lk/en/ad/${ad.slug}`
      const vehicle: Partial<ScrapedVehicle> = {
        title: ad.title,
        summary: ad.description,
        mileage: toNumberOrNull(ad.details),
        price: toNumberOrText(ad.price),
        description: ad.description,
        date: toDateString(getBeforeDate(new Date(), dateDiff || 0)),
        extra: {},
        owner: {
          company: ad.shopName,
          location: ad.location,
        },
        __META__: {
          source: 'ikman',
          imageURL: ad.imgUrl,
          sourceURL: pageURL,
          slug: ad.slug,
          individualURL,
          timestamp: toDateString(new Date()),
          pageId,
        },
      }

      if (individualURL && !ignoreIndividuals) {
        scrapeRiyasewanaIndividual(individualURL, vehicle)
      }
      classifieds.push(vehicle)
    }
  } catch (error) {
    console.error(error)
    throw error
  }

  return [classifieds, pages]
}

const scrapeRiyasewanaIndividual = async (
  individualURL: string,
  vehicle: Partial<ScrapedVehicle>
) => {
  const response = await axios.get(individualURL)
  const $ = cheerio.load(response.data)

  const initialData = getInitialData($)

  const detailAd: Partial<DetailAd> = initialData?.adDetail?.data?.ad ?? {}

  const contacts = getContacts(detailAd.contactCard)

  vehicle.description = detailAd.description

  if (detailAd.adDate) {
    const adDate = new Date(detailAd.adDate)
    if (adDate.toString() !== 'Invalid Date') {
      vehicle.date = toDateString(adDate)
    }
  }
  vehicle.owner = {
    ...vehicle.owner,
    contacts,
    location: detailAd.location?.name,
    company: detailAd.shop?.name,
    name: detailAd.contactCard?.name,
  }

  const properties = detailAd.properties || []
  const extra = vehicle.extra || {}
  properties.forEach((property) => {
    const { key, value, value_key } = property
    if (key === 'make') {
      extra.make = value
    }
    if (key === 'model') {
      extra.model = `${value} - ${value_key}`
    }
    if (key === 'edition') {
      extra.edition = value
    }
    if (key === 'model_year') {
      extra.year = toNumberOrNull(value)
    }
    if (key === 'condition') {
      extra.condition = value
    }
    if (key === 'transmission') {
      extra.transmission = value
    }
    if (key === 'body') {
      extra.body = value
    }
    if (key === 'fuel_type') {
      extra.fuelType = value
    }
    if (key === 'engine_capacity') {
      extra.engineCapacity = toNumberOrNull(value)
    }
    if (key === 'mileage') {
      vehicle.mileage = toNumberOrNull(value)
    }
  })

  vehicle.extra = {
    ...vehicle.extra,
    ...extra,
  }

  return detailAd
}

const getInitialData = (
  cheerioRoot: cheerio.Root | undefined = undefined
): Partial<InitialData> => {
  let initialData: Partial<InitialData> = {}

  if (cheerioRoot) {
    const scriptElements = cheerioRoot('script')
    for (const scriptElement of scriptElements) {
      const scriptString = cheerioRoot(scriptElement).text()
      if (scriptString.includes('window.initialData')) {
        const initialDataString = scriptString
          .trim()
          .split('window.initialData = ')[1]

        initialData = JSON.parse(initialDataString)
      }
    }
  }

  return initialData
}

const getPages = (paginationData: PaginationData | undefined): number[] => {
  if (!paginationData) return [1]

  const { pageSize, total: totalResuls } = paginationData
  const pages: number[] = []

  const totalPages = Math.ceil(totalResuls / pageSize)
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return pages
}

const getContacts = (contactCard: any): OwnerContact[] => {
  const contacts: OwnerContact[] = []

  const { phoneNumbers } = contactCard

  for (const phoneNumber of phoneNumbers) {
    const { number, verified } = phoneNumber
    const phone = toNumberOrNull(number)
    if (phone) {
      contacts.push({ phone, verified })
    }
  }

  return contacts
}

export default scrapeIkman
