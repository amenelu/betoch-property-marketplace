export type RawExternalListing = {
  sourceListingId: string;
  sourceUrl: string;
  title: string;
  description?: string;
  propertyType?: string;
  listingType?: string;
  price?: string | number;
  currency?: string;
  area?: string | number;
  areaUnit?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  locationText?: string;
  imageUrls?: string[];
};

export type NormalizedExternalListing = {
  sourceListingId: string;
  sourceUrl: string;
  title: string;
  description: string;
  propertyType: "apartment" | "house" | "villa" | "condominium" | "land" | "commercial" | "office" | "warehouse" | "other";
  listingType: "sale" | "rent" | "long_term_rent" | "medium_term_rent" | "short_term_stay";
  price: number | null;
  currency: string | null;
  areaSqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sourceLocationText: string | null;
  imageUrls: string[];
  warnings: string[];
};

/** Every approved source lives in its own adapter; adapters never write to the database. */
export interface PropertySourceAdapter<TDiscovery = string> {
  discover(): Promise<TDiscovery[]>;
  fetch(item: TDiscovery): Promise<unknown>;
  parse(payload: unknown): Promise<RawExternalListing[]>;
  normalize(listing: RawExternalListing): NormalizedExternalListing;
  validate(listing: NormalizedExternalListing): { valid: boolean; errors: string[] };
}

const propertyTypes: Record<string, NormalizedExternalListing["propertyType"]> = {
  apartment: "apartment", flat: "apartment", house: "house", home: "house",
  villa: "villa", condominium: "condominium", condo: "condominium", land: "land",
  commercial: "commercial", office: "office", warehouse: "warehouse",
};

export function normalizeExternalListing(raw: RawExternalListing): NormalizedExternalListing {
  const warnings: string[] = [];
  const propertyKey = raw.propertyType?.trim().toLowerCase() || "";
  const propertyType = propertyTypes[propertyKey] || "other";
  if (propertyType === "other" && propertyKey) warnings.push(`Unrecognized property type: ${raw.propertyType}`);

  const listingText = raw.listingType?.trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  const listingType = listingText === "sale" || listingText === "for_sale" ? "sale"
    : listingText === "short_stay" || listingText === "nightly" ? "short_term_stay"
      : listingText === "medium_term" || listingText === "weekly" ? "medium_term_rent"
        : listingText === "long_term" || listingText === "monthly" ? "long_term_rent" : "rent";

  const price = parseNumber(raw.price);
  if (raw.price != null && price == null) warnings.push("Price could not be normalized");
  const bedrooms = parseCount(raw.bedrooms);
  const bathrooms = parseCount(raw.bathrooms);
  let areaSqm = parseNumber(raw.area);
  const unit = raw.areaUnit?.trim().toLowerCase();
  if (areaSqm != null && ["ft2", "sqft", "square feet", "square foot"].includes(unit || "")) areaSqm = round(areaSqm * 0.092903);
  else if (areaSqm != null && unit && !["m2", "sqm", "square meter", "square meters"].includes(unit)) {
    areaSqm = null;
    warnings.push(`Ambiguous area unit: ${raw.areaUnit}`);
  }

  return {
    sourceListingId: raw.sourceListingId,
    sourceUrl: raw.sourceUrl,
    title: raw.title.trim(),
    description: raw.description?.trim() || "",
    propertyType,
    listingType,
    price,
    currency: raw.currency?.trim().toUpperCase() || null,
    areaSqm,
    bedrooms,
    bathrooms,
    sourceLocationText: raw.locationText?.trim() || null,
    imageUrls: (raw.imageUrls || []).filter(isHttpUrl),
    warnings,
  };
}

export function validateNormalizedListing(listing: NormalizedExternalListing) {
  const errors: string[] = [];
  if (!listing.sourceListingId.trim()) errors.push("Missing source listing ID");
  if (!isHttpUrl(listing.sourceUrl)) errors.push("Invalid source URL");
  if (listing.title.length < 3) errors.push("Title is too short");
  if (listing.price != null && listing.price <= 0) errors.push("Price must be positive");
  return { valid: errors.length === 0, errors };
}

function parseNumber(value: string | number | undefined) {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCount(value: string | number | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
  if (!value) return null;
  const numeric = value.match(/\d+/)?.[0];
  if (numeric) return Number(numeric);
  const words: Record<string, number> = { zero: 0, studio: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  const match = Object.keys(words).find((word) => value.toLowerCase().includes(word));
  return match ? words[match] : null;
}

const round = (value: number) => Math.round(value * 100) / 100;
const isHttpUrl = (value: string) => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
