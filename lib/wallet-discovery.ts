type WalletConnector = {
  id: string;
  getProvider: () => Promise<unknown>;
};

// Read the live connector list on every attempt: extensions can announce after
// the page loads. Prefer MetaMask's EIP-6963 provider over window.ethereum.
export async function findMetaMaskConnector<T extends WalletConnector>(
  getConnectors: () => readonly T[],
  timeoutMs = 1500,
): Promise<T | undefined> {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("eip6963:requestProvider"));

  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  do {
    const connectors = getConnectors();
    const candidates = [
      connectors.find((connector) => connector.id === "io.metamask"),
      connectors.find((connector) => connector.id === "metaMask"),
    ];
    for (const connector of candidates) {
      if (!connector) continue;
      try {
        if (await connector.getProvider()) return connector;
      } catch (error) {
        lastError = error;
      }
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise((resolve) => setTimeout(resolve, Math.min(100, remaining)));
  } while (Date.now() <= deadline);
  if (lastError) throw lastError;
  return undefined;
}
