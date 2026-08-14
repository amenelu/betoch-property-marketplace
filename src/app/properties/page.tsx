import { Header } from "@/components/header"; import { SearchExperience } from "@/components/search-experience"; import { properties } from "@/lib/data";
export default function PropertiesPage({searchParams}:{searchParams:Record<string,string|undefined>}){return <><Header/><main><SearchExperience initial={properties} params={searchParams}/></main></>}
