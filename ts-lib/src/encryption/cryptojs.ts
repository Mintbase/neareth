/**
 * This Key Manager is based on the cryptography package provided by
 * @nearfoundation/near-js-encryption-box
 * It relies on base58 encoding and requires a nonce to decrypt the key!
 */

import { HDNodeWallet } from "ethers";
import { KeyContract } from "../keyContract";
import { EthKeyManager } from "./interface";
import { NearAccount } from "../types";
import CryptoJS from "crypto-js";

export class CryptoJSKeyManager implements EthKeyManager {
  // EthKeyContract connected to account for `nearPrivateKey`.
  contract: KeyContract;

  constructor(contract: KeyContract) {
    this.contract = contract;
  }

  async encryptAndSetKey(
    ethWallet: HDNodeWallet,
    encryptionKey: string,
  ): Promise<string | undefined> {
    let encryptedKey = CryptoJS.AES.encrypt(
      ethWallet.privateKey,
      encryptionKey,
    );
    console.log("Posting Encrypted Key", encryptedKey.toString());
    await this.contract.methods.set_key({
      encrypted_key: encryptedKey.toString(),
    });
    return undefined;
  }

  async retrieveAndDecryptKey(
    nearAccount: NearAccount,
    // nonce?: string | undefined,
  ): Promise<string> {
    const retrievedKey = await this.contract.methods.get_key({
      account_id: nearAccount.accountId,
    });
    let bytes = CryptoJS.AES.decrypt(retrievedKey!, nearAccount.privateKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
