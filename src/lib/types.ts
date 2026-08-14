export type VerificationLevel = "unverified" | "identity_verified" | "location_verified" | "documents_reviewed" | "fully_verified";
export type ListingType = "sale" | "rent";

export interface Property {
  id: string; slug: string; title: string; description: string; propertyType: string; listingType: ListingType;
  price: number; currency: "ETB"; areaSqm: number; bedrooms: number; bathrooms: number; parkingSpaces: number;
  neighborhood: string; subcity: string; city: string; latitude: number; longitude: number; image: string;
  images: string[]; verificationStatus: VerificationLevel; furnished: boolean; hasElevator: boolean; hasGenerator: boolean;
  hasWaterTank: boolean; hasSecurity: boolean; hasBalcony: boolean; hasGarden: boolean; createdAt: string;
  seller: { id: string; name: string; role: "owner" | "broker"; agency?: string; memberSince: string; activeListings: number; phone?: string; whatsapp?: string; verified: boolean };
}
