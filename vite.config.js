import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { networkInterfaces } from 'node:os'

function isPrivateIpv4(address) {
  const octets = address.split('.').map(Number)
  return octets.length === 4 && (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  )
}

function usePresentationNetworkAddress(server) {
  server.middlewares.use('/__presentation/network-address', (_request, response) => {
    const addresses = Object.values(networkInterfaces())
      .flatMap((interfaces) => interfaces || [])
      .filter(({ address, family, internal }) =>
        !internal && (family === 'IPv4' || family === 4) && isPrivateIpv4(address),
      )
      .map(({ address }) => address)

    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ addresses: [...new Set(addresses)] }))
  })
}

function presentationNetworkAddressPlugin() {
  return {
    name: 'presentation-network-address',
    configureServer: usePresentationNetworkAddress,
    configurePreviewServer: usePresentationNetworkAddress,
  }
}

export default defineConfig({
  plugins: [react(), presentationNetworkAddressPlugin()],
  server: { host: '0.0.0.0' },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts'
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor'
        },
      },
    },
  },
})
