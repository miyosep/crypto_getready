import assert from "node:assert/strict";
import { test } from "node:test";
import { findMetaMaskConnector } from "../lib/wallet-discovery";
import { friendlyError } from "../lib/errors";

const connector = (id: string, provider: unknown = {}) => ({
  id,
  getProvider: async () => provider,
});

test("prefers announced MetaMask even when a different wallet or legacy connector comes first", async () => {
  const metamask = connector("io.metamask");
  assert.equal(await findMetaMaskConnector(() => [connector("io.rabby"), connector("metaMask"), metamask], 0), metamask);
});

test("finds MetaMask announced after the first lookup", async () => {
  const metamask = connector("io.metamask");
  let attempts = 0;
  assert.equal(await findMetaMaskConnector(() => ++attempts === 1 ? [] : [metamask], 300), metamask);
});

test("uses legacy MetaMask when EIP-6963 is unavailable", async () => {
  const legacy = connector("metaMask");
  assert.equal(await findMetaMaskConnector(() => [legacy], 0), legacy);
});

test("does not connect another wallet when MetaMask is missing", async () => {
  assert.equal(await findMetaMaskConnector(() => [connector("io.rabby"), connector("metaMask", null)], 0), undefined);
});

test("provider failures are not reported as an uninstalled wallet", async () => {
  const error = new Error("Provider access failed");
  await assert.rejects(findMetaMaskConnector(() => [{ id: "io.metamask", getProvider: async () => { throw error; } }], 0), error);
});

test("pending wallet requests tell the user to open MetaMask", () => {
  assert.match(friendlyError({ code: -32002 }), /待处理/);
});
