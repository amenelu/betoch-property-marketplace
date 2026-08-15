import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchExperience } from "@/components/search-experience";
import { getPublishedProperties } from "@/lib/property-repository";
export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const properties = await getPublishedProperties();
  return (
    <>
      <Header />
      <main>
        <SearchExperience initial={properties} params={searchParams} />
      </main>
      <Footer />
    </>
  );
}
