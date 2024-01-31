import { ethers } from "ethers";
import { NearAccount } from "../types";

export interface EthKeyManager {
  /**
   *
   * @param ethWallet - Ethereum Wallet to be stored on key contract.
   * @param encryptionKey - Secret key of for encryption.
   * @returns Nonce if needed decrypt encoded key, otherwise nothing.
   */
  encryptAndSetKey(
    ethWallet: ethers.HDNodeWallet,
    encryptionKey: string,
  ): Promise<string | undefined>;

  retrieveAndDecryptKey(
    nearAccount: NearAccount,
    nonce?: string,
  ): Promise<string>;

  // encodeEthKey(key: string): string;
  // decodeEthKey(key: string): string;
}
