import type { Metadata } from "next"; import {DemoProvider} from "@/components/demo-provider"; import "./globals.css";
export const metadata:Metadata={title:{default:"Betoch — Property in Addis Ababa",template:"%s | Betoch"},description:"Discover and compare verified property listings in Addis Ababa, Ethiopia.",metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000")};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><DemoProvider>{children}</DemoProvider></body></html>}
