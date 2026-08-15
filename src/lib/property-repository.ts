import "server-only";
import { getServiceClient } from "./supabase";
import { properties as developmentFixtures } from "./data";
import type { Property } from "./types";
const fallbackImage =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80";
export async function getPublishedProperties(): Promise<Property[]> {
  const db = getServiceClient();
  if (!db)
    return process.env.NODE_ENV === "development" ? developmentFixtures : [];
  const { data, error } = await db
    .from("properties")
    .select("*,property_images(*),property_pricing(*),property_rules(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error)
    throw new Error(`Unable to load published properties: ${error.message}`);
  const ownerIds = Array.from(
    new Set((data || []).map((x: any) => x.owner_id)),
  );
  const { data: profiles } = ownerIds.length
    ? await db.from("profiles").select("*").in("id", ownerIds)
    : { data: [] };
  const profileMap = new Map((profiles || []).map((x: any) => [x.id, x]));
  return (data || []).map((row: any) =>
    mapProperty(row, profileMap.get(row.owner_id), db),
  );
}
export async function getPublishedProperty(slug: string) {
  const all = await getPublishedProperties();
  return all.find((x) => x.slug === slug) || null;
}
export async function getSellerWithListings(id: string) {
  const listings = (await getPublishedProperties()).filter(
    (x) => x.seller.id === id,
  );
  return { seller: listings[0]?.seller || null, listings };
}
function mapProperty(
  row: any,
  profile: any,
  db: NonNullable<ReturnType<typeof getServiceClient>>,
): Property {
  const ordered = [...(row.property_images || [])].sort(
    (a: any, b: any) => a.display_order - b.display_order,
  );
  const images = ordered.map((x: any) =>
    x.storage_path.startsWith("http")
      ? x.storage_path
      : db.storage.from("property-images").getPublicUrl(x.storage_path).data
          .publicUrl,
  );
  const prices = (row.property_pricing || []).map((x: any) => ({
    type: x.pricing_type,
    amount: Number(x.amount),
  }));
  const rules = Array.isArray(row.property_rules)
    ? row.property_rules[0]
    : row.property_rules;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    propertyType: titleCase(row.property_type),
    listingType: row.listing_type,
    price: Number(row.price),
    currency: "ETB",
    areaSqm: Number(row.area_sqm),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpaces: row.parking_spaces,
    neighborhood: row.neighborhood || "Addis Ababa",
    subcity: row.subcity || "Addis Ababa",
    city: row.city,
    latitude: row.latitude || 9.03,
    longitude: row.longitude || 38.74,
    image: images[0] || fallbackImage,
    images: images.length ? images : [fallbackImage],
    verificationStatus: row.verification_status,
    furnished: row.furnished,
    hasElevator: row.has_elevator,
    hasGenerator: row.has_generator,
    hasWaterTank: row.has_water_tank,
    hasSecurity: row.has_security,
    hasBalcony: row.has_balcony,
    hasGarden: row.has_garden,
    hasSolar: row.has_solar,
    hasBackupBattery: row.has_backup_battery,
    waterTankCapacity: row.water_tank_capacity,
    fiberInternet: row.fiber_internet,
    backupInternet: row.backup_internet,
    securityGuard: row.security_guard,
    gatedCompound: row.gated_compound,
    cctv: row.cctv,
    fullyFurnished: row.fully_furnished,
    semiFurnished: row.semi_furnished,
    kitchenEquipped: row.kitchen_equipped,
    washingMachine: row.washing_machine,
    television: row.television,
    workspace: row.workspace,
    airConditioning: row.air_conditioning,
    heating: row.heating,
    maxGuests: row.max_guests,
    beds: row.beds,
    bedTypes: row.bed_types,
    prices,
    rules: rules
      ? {
          petsAllowed: rules.pets_allowed,
          smokingAllowed: rules.smoking_allowed,
          partiesAllowed: rules.parties_allowed,
          childrenAllowed: rules.children_allowed,
          checkInTime: rules.check_in_time?.slice(0, 5) || "14:00",
          checkOutTime: rules.check_out_time?.slice(0, 5) || "11:00",
        }
      : undefined,
    verifiedPhotos: row.verified_photos,
    verifiedLocation: row.verified_location,
    verifiedAmenities: row.verified_amenities,
    createdAt: row.created_at,
    seller: {
      id: row.owner_id,
      name: profile?.name || "Betoch seller",
      role: profile?.role === "owner" ? "owner" : "broker",
      agency: profile?.agency_name || undefined,
      memberSince: profile?.created_at || row.created_at,
      activeListings: 0,
      phone: profile?.show_phone ? profile.phone : undefined,
      whatsapp: profile?.show_whatsapp ? profile.whatsapp : undefined,
      verified: profile?.verification_status !== "unverified",
      hostRating: profile?.host_rating
        ? Number(profile.host_rating)
        : undefined,
      reviewCount: profile?.review_count,
      responseRate: profile?.response_rate
        ? Number(profile.response_rate)
        : undefined,
      responseTime: profile?.response_time || undefined,
    },
  };
}
const titleCase = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());
