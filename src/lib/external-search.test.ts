import { describe, expect, it } from "vitest";
import { buildExternalSearchLinks } from "./external-search";

describe("external comparison search", () => {
  it("encodes active filters into five safe HTTPS links", () => {
    const links = buildExternalSearchLinks({ location: "Bole Medhanealem", listingType: "sale", propertyType: "Apartment", minBeds: 2 });
    expect(links).toHaveLength(5);
    for (const link of links) {
      expect(new URL(link.url).protocol).toBe("https:");
      expect(decodeURIComponent(link.url)).toContain("Bole");
      expect(link.relationship).toBe("External search");
      expect(link.transferred).toContain("Location: Bole Medhanealem");
      expect(link.transferred).toContain("Property type: Apartment");
      expect(link.transferred).toContain("Bedrooms: 2+");
    }
  });

  it("uses a native sale path where the source supports it", () => {
    const [epc] = buildExternalSearchLinks({ listingType: "sale" });
    expect(epc.url).toContain("/for-sale?");
    expect(epc.transferred).toContain("Location: Addis Ababa");
    expect(epc.transferred).toContain("Listing type: For sale (site filter)");
  });
});
