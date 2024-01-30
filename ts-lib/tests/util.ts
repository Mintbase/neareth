const nearAPI = require("near-api-js");
const { connect, KeyPair, keyStores, utils } = nearAPI;

interface AccountInfo {
  accountId: string;
  publicKey: string;
  privateKey: string;
}

export async function createAccount(
  masterAccountId: string,
  masterPrivateKey: string,
  newAccountId: string,
  initialBalance: string,
): Promise<AccountInfo> {
  // Configure the connection to the NEAR network
  const config = {
    networkId: "testnet",
    keyStore: new keyStores.InMemoryKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
  };

  // Connect to NEAR
  const near = await connect(config);

  // Load the master account using its private key
  const masterKeyPair = KeyPair.fromString(masterPrivateKey);
  await config.keyStore.setKey("testnet", masterAccountId, masterKeyPair);
  const masterAccount = await near.account(masterAccountId);

  // Generate a key pair for the new account
  const newAccountKeyPair = KeyPair.fromRandom("ed25519");

  // Create the new account and attach the public key
  await masterAccount.createAccount(
    newAccountId,
    newAccountKeyPair.publicKey,
    utils.format.parseNearAmount(initialBalance.toString()),
  );

  // Save the new account's private key (for later use)
  await config.keyStore.setKey("testnet", newAccountId, newAccountKeyPair);

  return {
    accountId: newAccountId,
    publicKey: newAccountKeyPair.publicKey.toString(),
    privateKey: newAccountKeyPair.secretKey,
  };
}
