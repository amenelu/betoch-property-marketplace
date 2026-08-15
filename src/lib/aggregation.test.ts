import { describe, expect, it } from "vitest";
import { normalizeExternalListing, validateNormalizedListing } from "./aggregation";

describe("external listing normalization", () => {
  it("normalizes bedroom words, prices, types and square feet", () => {
    const result = normalizeExternalListing({
      sourceListingId: "abc-1", sourceUrl: "https://example.com/abc-1", title: "Two bedroom flat",
      propertyType: "flat", listingType: "for sale", price: "ETB 18,000,000", currency: "etb",
      area: "1,076.39", areaUnit: "sqft", bedrooms: "two bedrooms", bathrooms: "2 baths",
    });
    expect(result).toMatchObject({ propertyType: "apartment", listingType: "sale", price: 18000000, currency: "ETB", areaSqm: 100, bedrooms: 2, bathrooms: 2 });
  });

  it("does not guess an ambiguous area conversion", () => {
    const result = normalizeExternalListing({ sourceListingId: "1", sourceUrl: "https://example.com/1", title: "Land parcel", area: 10, areaUnit: "plots" });
    expect(result.areaSqm).toBeNull();
    expect(result.warnings).toContain("Ambiguous area unit: plots");
  });

  it("rejects invalid source URLs", () => {
    const result = normalizeExternalListing({ sourceListingId: "1", sourceUrl: "javascript:alert(1)", title: "Office" });
    expect(validateNormalizedListing(result)).toEqual({ valid: false, errors: ["Invalid source URL"] });
  });
});
