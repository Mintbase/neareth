import { HDNodeWallet } from "ethers";
import { KeyContract } from "../keyContract";
import { EthKeyManager } from "./interface";
import { NearAccount } from "../types";
import bs58 from "bs58";
import { KeyPair } from "near-api-js";
import { create, open } from "@nearfoundation/near-js-encryption-box";

export class Base58KeyManager implements EthKeyManager {
  // EthKeyContract connected to account for `nearPrivateKey`.
  contract: KeyContract;

  constructor(contract: KeyContract) {
    this.contract = contract;
  }

  async encryptAndSetKey(
    ethWallet: HDNodeWallet,
    encryptionKey: string,
  ): Promise<string | null> {
    let keyPair = KeyPair.fromString(encryptionKey);
    let encodedEthKey = this.encodeEthKey(ethWallet.privateKey);
    const { secret: encryptedKey, nonce } = create(
      encodedEthKey,
      keyPair.getPublicKey().toString(),
      encryptionKey,
    );
    console.log("Posting Encrypted Key", encryptedKey, nonce);
    await this.contract.methods.set_key({ encrypted_key: encryptedKey });
    return nonce;
  }

  async retrieveAndDecryptKey(
    nearAccount: NearAccount,
    nonce?: string | undefined,
  ): Promise<string> {
    const retrievedKey = await this.contract.methods.get_key({
      account_id: nearAccount.accountId,
    });
    let keyPair = KeyPair.fromString(nearAccount.privateKey);
    const decryptedKey = open(
      retrievedKey!,
      keyPair.getPublicKey().toString(),
      nearAccount.privateKey,
      nonce!,
    );
    if (decryptedKey === null) {
      throw new Error("Unable to decrypt key!");
    }
    return this.decodeEthKey(decryptedKey);
  }

  private encodeEthKey(key: string): string {
    const bytes = Buffer.from(key.slice(2), "hex");
    const encodedKey = bs58.encode(bytes);
    return encodedKey;
  }

  private decodeEthKey(key: string): string {
    const bytes = Buffer.from(bs58.decode(key));
    return "0x" + bytes.toString("hex");
  }
}
