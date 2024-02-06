import { connect, KeyPair, keyStores, utils } from "near-api-js";
import * as dotenv from "dotenv";
import * as path from "path";
import {
  Base58KeyManager,
  KeyContract,
  CryptoJSKeyManager,
  EthPrivateKey,
  NearPrivateKey,
} from "../src";

dotenv.config({
  path: path.resolve(__dirname, "../../neardev/dev-account.env"),
});

const contractName = process.env.CONTRACT_NAME as string;
if (!contractName) {
  throw new Error("CONTRACT_NAME not found in environment");
}

const nearPrivateKey = process.env.TEST_PK as string;
if (!nearPrivateKey) {
  throw new Error("TEST_PK not found in environment");
}

const keyStore = new keyStores.InMemoryKeyStore();
let keyPair = KeyPair.fromString(nearPrivateKey);
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
  let ethPk: EthPrivateKey;
  let nearPk: NearPrivateKey;

  beforeAll(async () => {
    contract = await initContract();
    ethPk = new EthPrivateKey(
      "0x38b499b2263de8d23944746a6922757e8da6184828d98fbfd6c88ebee1fad111",
    );
    nearPk = new NearPrivateKey(nearPrivateKey);
  });

  it("Base58 RoundTrip", async () => {
    const keyManager = new Base58KeyManager(contract);
    // TODO - include nonce on contract so we don't have to remember it.
    const nonce = await keyManager.encryptAndSetKey(ethPk, nearPrivateKey);

    const decryptedKey = await keyManager.retrieveAndDecryptKey(
      { accountId, privateKey: nearPk },
      nonce,
    );
    expect(decryptedKey).toStrictEqual(ethPk);
  });

  it("CryptoJS-AES RoundTrip", async () => {
    const keyManager = new CryptoJSKeyManager(contract);
    await keyManager.encryptAndSetKey(ethPk, nearPrivateKey);

    const decryptedKey = await keyManager.retrieveAndDecryptKey({
      accountId,
      privateKey: nearPk,
    });
    expect(decryptedKey).toStrictEqual(ethPk);
  });
});
