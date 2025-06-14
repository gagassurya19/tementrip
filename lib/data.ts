import type { Destination } from "./types"
import { jakartaDestinations } from "./destinations/jakarta-destinations"
import { baliDestinations } from "./destinations/bali-destinations"
import { batamDestinations } from "./destinations/batam-destinations"
import { lombokDestinations } from "./destinations/lombok-destinations"
import { medanDestinations } from "./destinations/medan-destinations"
import { padangDestinations } from "./destinations/padang-destinations"
import { yogyakartaDestinations } from "./destinations/yogyakarta-destinations"

// Export all destinations from all cities
export const destinations: Destination[] = [
  ...jakartaDestinations,
  ...baliDestinations,
  ...batamDestinations,
  ...lombokDestinations,
  ...medanDestinations,
  ...padangDestinations,
  ...yogyakartaDestinations
]

// Export individual city destinations for specific use cases
export {
  jakartaDestinations,
  baliDestinations,
  batamDestinations,
  lombokDestinations,
  medanDestinations,
  padangDestinations,
  yogyakartaDestinations
}
