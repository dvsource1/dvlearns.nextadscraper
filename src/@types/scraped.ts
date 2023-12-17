export interface BaseScraped<T> {
  results: T[]
  count: number
  timestamp: string | null
}

export interface Scraped<T> extends BaseScraped<T> {
  baseURL: string
  source: string
}

export interface ScrapedVehicle {
  title: string
  price: number | string
  mileage: number | null
  date: string | null
  owner: Partial<ScrapedVehicleOwner>
  extra: Partial<ScrapedVehicleExtra>
  summary: string
  description: string
  __META__: Partial<ScrapedVehicleMeta>
}

export interface ScrapedVehicleOwner {
  name: string
  company: string
  contacts: OwnerContact[] | null
  location: string
}

export interface OwnerContact {
  phone: number | null
  verified: boolean
}

export interface ScrapedVehicleExtra {
  mileage: number | null
  make: string
  model: string
  edition: string
  condition: string
  body: string
  year: number | null
  transmission: string
  fuelType: string
  engineCapacity: number | null
  options: string[]
}

interface ScrapedVehicleMeta {
  source: string
  sourceURL: string
  slug: string
  individualURL: string
  imageURL: string
  timestamp: string | null
  pageId: number
}
