/** @type {import('next').NextConfig} */
const nextConfig={
  poweredByHeader:false,
  images:{remotePatterns:[
    {protocol:"https",hostname:"images.unsplash.com"},
    ...(process.env.NEXT_PUBLIC_SUPABASE_URL?[{protocol:"https",hostname:new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,pathname:"/storage/v1/object/public/property-images/**"}]:[])
  ]},
  async headers(){return [{source:"/:path*",headers:[
    {key:"X-Content-Type-Options",value:"nosniff"},
    {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
    {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(self)"},
    {key:"X-Frame-Options",value:"SAMEORIGIN"}
  ]}]}
};
export default nextConfig;
