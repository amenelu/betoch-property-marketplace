export type VerificationLevel = "unverified" | "identity_verified" | "location_verified" | "documents_reviewed" | "fully_verified";
export type ListingType = "sale" | "rent" | "long_term_rent" | "medium_term_rent" | "short_term_stay";
export type PricingType = "sale_price" | "monthly_price" | "weekly_price" | "nightly_price" | "cleaning_fee" | "security_deposit";
export interface PropertyPrice { type: PricingType; amount: number }
export interface PropertyRules { petsAllowed:boolean; smokingAllowed:boolean; partiesAllowed:boolean; childrenAllowed:boolean; checkInTime:string; checkOutTime:string }

export interface Property {
  id: string; slug: string; title: string; description: string; propertyType: string; listingType: ListingType;
  price: number; currency: "ETB"; areaSqm: number; bedrooms: number; bathrooms: number; parkingSpaces: number;
  neighborhood: string; subcity: string; city: string; latitude: number; longitude: number; image: string;
  images: string[]; verificationStatus: VerificationLevel; furnished: boolean; hasElevator: boolean; hasGenerator: boolean;
  hasWaterTank: boolean; hasSecurity: boolean; hasBalcony: boolean; hasGarden: boolean; createdAt: string;
  hasSolar?:boolean; hasBackupBattery?:boolean; waterTankCapacity?:number; fiberInternet?:boolean; backupInternet?:boolean; securityGuard?:boolean; gatedCompound?:boolean; cctv?:boolean;
  fullyFurnished?:boolean; semiFurnished?:boolean; kitchenEquipped?:boolean; washingMachine?:boolean; television?:boolean; workspace?:boolean; airConditioning?:boolean; heating?:boolean;
  maxGuests?:number; beds?:number; bedTypes?:string[]; prices?:PropertyPrice[]; rules?:PropertyRules; rating?:number; reviewCount?:number;
  verifiedPhotos?:boolean; verifiedLocation?:boolean; verifiedAmenities?:boolean;
  seller: { id: string; name: string; role: "owner" | "broker"; agency?: string; memberSince: string; activeListings: number; phone?: string; whatsapp?: string; verified: boolean; hostRating?:number; reviewCount?:number; responseRate?:number; responseTime?:string };
}
