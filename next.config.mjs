/** @type {import('next').NextConfig} */
const nextConfig = {

    typescript: {
      ignoreBuildErrors: false,
    },

     eslint: {
       // During development you can disable eslint by setting to true
         ignoreDuringBuilds: true,
       }
  };
  
  export default nextConfig;