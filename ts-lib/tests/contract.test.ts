import { connect, Contract, KeyPair, keyStores, utils } from "near-api-js";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import { Base58KeyManager, KeyContract, CryptoJSKeyManager } from "../src";

dotenv.config({
  path: path.resolve(__dirname, "../../neardev/dev-account.env"),
});
jest.setTimeout(30000);

const contractName = process.env.CONTRACT_NAME as string;
if (!contractName) {
  throw new Error("CONTRACT_NAME not found in environment");
}

const privateKey = process.env.TEST_PK as string;
if (!privateKey) {
  throw new Error("TEST_PK not found in environment");
}

const keyStore = new keyStores.InMemoryKeyStore();
let keyPair = KeyPair.fromString(privateKey);
const accountId = process.env.TEST_ACCOUNT_ID!;

async function initContract(): Promise<KeyContract> {
  await keyStore.setKey("testnet", accountId, keyPair);

  const config = {
    networkId: "testnet",
    keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };

  const near = await connect(config);
  const account = await near.account(accountId);

  const contract = new KeyContract(contractName, account);

  return contract;
}

describe("EthKeys contract tests", () => {
  let contract: KeyContract;

  beforeAll(async () => {
    contract = await initContract();
  });

  it("Base58 RoundTrip", async () => {
    const keyManager = new Base58KeyManager(contract);

    // TODO - can we create not random?
    const ethWallet = ethers.Wallet.createRandom();

    // TODO - include nonce on contract so we don't have to remember it.
    const nonce = await keyManager.encryptAndSetKey(ethWallet, privateKey);

    const decryptedKey = await keyManager.retrieveAndDecryptKey(
      { accountId, privateKey },
      nonce,
    );
    expect(decryptedKey).toBe(ethWallet.privateKey);
  });

  it("CryptoJS-AES RoundTrip", async () => {
    const keyManager = new CryptoJSKeyManager(contract);
    const ethWallet = ethers.Wallet.createRandom();

    await keyManager.encryptAndSetKey(ethWallet, privateKey);

    const decryptedKey = await keyManager.retrieveAndDecryptKey({
      accountId,
      privateKey,
    });
    expect(decryptedKey).toBe(ethWallet.privateKey);
  });
});
