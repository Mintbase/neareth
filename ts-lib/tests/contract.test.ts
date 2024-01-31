import { connect, Contract, KeyPair, keyStores, utils } from "near-api-js";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
// @ts-ignore
import { create, open } from "@nearfoundation/near-js-encryption-box";
import bs58 from "bs58";

dotenv.config({
  path: path.resolve(__dirname, "../../neardev/dev-account.env"),
});
jest.setTimeout(30000);

interface EthKeysContract {
  set_key: (args: { encrypted_key: string }) => Promise<void>;
  get_key: (args: { account_id: string }) => Promise<string | null>;
}

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

async function initContract(): Promise<EthKeysContract> {
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

  const contract = new Contract(account, contractName, {
    viewMethods: ["get_key"],
    changeMethods: ["set_key"],
    useLocalViewExecution: false,
  }) as unknown as EthKeysContract;

  return contract;
}

function encodeEthKey(key: string): string {
  const bytes = Buffer.from(key.slice(2), "hex");
  const encodedKey = bs58.encode(bytes);
  return encodedKey;
}

function decodeEthKey(key: string): string {
  const bytes = Buffer.from(bs58.decode(key));
  return "0x" + bytes.toString("hex");
}

describe("EthKeys contract tests", () => {
  let contract: EthKeysContract;

  beforeAll(async () => {
    contract = await initContract();
  });

  it("should generate ethWallet, encode and encrypt private key, set value on contract, retrieve, decrypt and match", async () => {
    // TODO - can we create not random?
    let ethWallet = ethers.Wallet.createRandom();
    let encodedEthKey = encodeEthKey(ethWallet.privateKey);
    const { secret: encryptedKey, nonce } = create(
      encodedEthKey,
      keyPair.getPublicKey().toString(),
      privateKey,
    );
    console.log("Encrypted Key", encryptedKey, nonce);
    await contract.set_key({ encrypted_key: encryptedKey });
    const retrievedKey = await contract.get_key({ account_id: accountId });
    const decryptedKey = open(
      retrievedKey!,
      keyPair.getPublicKey().toString(),
      privateKey,
      nonce,
    );
    expect(decodeEthKey(decryptedKey!)).toBe(ethWallet.privateKey);
  });
});
