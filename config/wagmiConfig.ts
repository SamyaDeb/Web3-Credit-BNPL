import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { polygonAmoy } from './chains';

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],

  transports: {
    [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology", {
      timeout: 30_000, 
      retryCount: 3,
      retryDelay: 1_000,
    }),
  },

  connectors: [
    injected(),
  ],

  ssr: true,
});
