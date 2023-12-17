import { Any, AnyRecord } from '.'

export interface InitialData {
  serp: Serp
  adDetail: TypeData<{ ad: DetailAd }>
}

interface Serp {
  ads: TypeData<AdsData>
}

interface TypeData<T> {
  type: 'Success'
  data: T
}

interface AdsData {
  ads: AdBase[]
  topAds: AdBase[]
  spotlights: AdBase[]
  paginationData: PaginationData
}

export interface AdBase {
  id: string
  slug: string
  title: string
  description: string
  isMember: boolean
  isAuthDealer: boolean
  isFeaturedMember: boolean
  membershipLevel: string | 'free' | 'premium'
  imgUrl: string
  isLocalJob: boolean
}

export interface Ad extends AdBase {
  details: string
  price: string
  discount: number
  mrp: number
  shopName: string
  isDoorstepDelivery: boolean
  isDeliveryFree: boolean
  isTopAd: boolean
  isUrgentAd: boolean
  timeStamp: string
  lastBumpUpDate: string | 'just now'
  category: Category
  isVerified: boolean
  isJobAd: boolean
  location: string
  adType: string | 'for_sale'
}

export interface DetailAd extends AdBase {
  account: DetailAdAccount
  properties: DetailAdProperty[]
  type: string
  status: string
  postedDate: number
  adDate: string
  deactivates: string
  category: DetailAdCategory
  location: DetailAdLocation
  area: DetailAdArea
  contactCard: DetailAdContact
  images: DetailAdImages
  shop: AnyRecord
  money: DetailAdMoney
  statistics: AnyRecord
  job: AnyRecord
  isDeliveryFree: boolean
  memberLogo: string
}

export interface DetailAdCategory {
  id: number
  name: string
  children: number[]
  ad_types: string[]
  serp_type: string
  available_serp_layouts: string[]
  default_serp_layout: string | 'single_column' | 'fluid'
  default_ad_type: string | 'for_sale'
  type: string
  slug: string
  form_view_version: string
  post_ad_form_view_version: string
  parentId: number | -1
  parent: DetailAdCategory
}

export interface DetailAdLocation {
  id: number
  name: string
  children: number[]
  geography: LocationGeography
  geo_region: string
  slug: string
  link: string
  parent: DetailAdLocation
  parentId: number | -1
}

export interface LocationGeography {
  simple_polygons: {
    coordinates: LatitudeLongitude[]
  }[]
}

export interface LatitudeLongitude {
  latitude: number
  longitude: number
}

export interface DetailAdArea {
  id: number
  name: string
}

export interface DetailAdContact {
  name: string
  phoneNumbers: ContactPhoneNumber[]
  chatEnabled: true
}

export interface ContactPhoneNumber {
  number: string
  verified: true
}

export interface DetailAdImages {
  meta: SrcAlt[]
  base_uri: string
  metadata: Any[]
}

export interface SrcAlt {
  src: string
  alt: string
}

export interface DetailAdMoney {
  label: string | 'Price'
  amount: string
}

export interface DetailAdAccount {
  id: string
  traits: AnyRecord
}

export interface DetailAdProperty {
  label:
    | string
    | 'Brand'
    | 'Model'
    | 'Trim / Edition'
    | 'Year of Manufacture'
    | 'Condition'
    | 'Transmission'
    | 'Body type'
    | 'Fuel type'
    | 'Engine capacity'
    | 'Mileage'
  value: string
  key:
    | string
    | 'brand'
    | 'model'
    | 'edition'
    | 'model_year'
    | 'condition'
    | 'transmission'
    | 'body'
    | 'fuel_type'
    | 'engine_capacity'
    | 'mileage'
  value_key: string
}

interface Category {
  id: number
  name: string
}

export interface PaginationData {
  total: number
  pageSize: number
  activePage: number
}
