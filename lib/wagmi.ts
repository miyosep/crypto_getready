import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { settings } from "./config";

export function makeWagmiConfig() {
  return createConfig({
    chains: [sepolia],
    connectors: [injected({ target: "metaMask" })],
    multiInjectedProviderDiscovery: true,
    ssr: true,
    transports: {
      [sepolia.id]: http(
        settings.errors.some((e) => e.includes("RPC"))
          ? undefined
          : settings.rpcUrl,
        { timeout: 15000, retryCount: 1 },
      ),
    },
  });
}
