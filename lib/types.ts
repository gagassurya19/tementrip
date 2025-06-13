export interface Destination {
  imageUrl: string
  title: string
  totalScore: number
  reviewsCount: number
  state: string
  city: string
  phone: string
  categoryName: string
  description: string
  placeId: string
  location: {
    lat: number
    lng: number
  }
  tripDuration?: number
}
