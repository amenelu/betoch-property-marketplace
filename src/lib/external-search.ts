export type ExternalSearchFilters = {
  location?: string;
  listingType?: string;
  propertyType?: string;
  minBeds?: number;
};

export type ExternalSearchLink = {
  id: string;
  name: string;
  url: string;
  relationship: "External search";
  transferred: string[];
  notTransferred: string[];
  note: string;
};

type SourceDefinition = {
  id: string;
  name: string;
  note: string;
  buildUrl: (query: string, filters: ExternalSearchFilters) => string;
  nativeListingType?: boolean;
};

const sources: SourceDefinition[] = [
  {
    id: "ethiopia-property-centre",
    name: "Ethiopia Property Centre",
    note: "Betoch is not affiliated with this source and does not copy its listings.",
    nativeListingType: true,
    buildUrl: (query, filters) => {
      const path = filters.listingType === "sale" ? "for-sale" : filters.listingType ? "for-rent" : "search";
      return `https://ethiopiapropertycentre.com/${path}?${new URLSearchParams({ query })}`;
    },
  },
  {
    id: "ethiopian-properties",
    name: "EthiopianProperties.com",
    note: "Opens the source's public keyword search. Results and availability belong to the source.",
    buildUrl: (query) => `https://www.ethiopianproperties.com/?${new URLSearchParams({ s: query })}`,
  },
  {
    id: "properties-in-addis",
    name: "Properties in Addis",
    note: "Opens the source's public keyword search. Betoch does not import its content.",
    buildUrl: (query) => `https://propertiesinaddis.com/?${new URLSearchParams({ s: query })}`,
  },
  {
    id: "addis-property-listings",
    name: "Addis Property Listings",
    note: "Opens the source's public keyword search in a new tab.",
    buildUrl: (query) => `https://addispropertylistings.com/?${new URLSearchParams({ s: query })}`,
  },
  {
    id: "facebook-marketplace",
    name: "Facebook Marketplace",
    note: "Facebook may require sign-in. Betoch does not access or collect Facebook listing data.",
    buildUrl: (query) => `https://www.facebook.com/marketplace/addisababa/search/?${new URLSearchParams({ query })}`,
  },
];

export function buildExternalSearchLinks(filters: ExternalSearchFilters): ExternalSearchLink[] {
  const terms = [
    filters.minBeds ? `${filters.minBeds}+ bedroom` : "",
    filters.propertyType || "property",
    filters.listingType === "sale" ? "for sale" : filters.listingType ? "for rent" : "",
    filters.location || "Addis Ababa",
  ].filter(Boolean);
  const query = terms.join(" ");
  const baseTransferred = [
    `Location: ${filters.location || "Addis Ababa"}`,
    filters.propertyType && `Property type: ${filters.propertyType}`,
    filters.minBeds && `Bedrooms: ${filters.minBeds}+`,
  ].filter(Boolean) as string[];
  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    url: source.buildUrl(query, filters),
    relationship: "External search",
    transferred: [
      ...baseTransferred,
      ...(filters.listingType
        ? [`Listing type: ${filters.listingType === "sale" ? "For sale" : "For rent"}${source.nativeListingType ? " (site filter)" : ""}`]
        : []),
    ],
    notTransferred: ["price", "verification", "amenities", "Betoch inventory source"],
    note: source.note,
  }));
}
