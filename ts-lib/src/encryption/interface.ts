import { EthPrivateKey, NearAccount } from "../types";

export interface EthKeyManager {
  /**
   *
   * @param ethPrivateKey - Ethereum Private Key to be stored on key contract.
   * @param encryptionKey - Secret key of for encryption.
   * @returns Nonce if needed decrypt encoded key, otherwise nothing.
   */
  encryptAndSetKey(
    ethPrivateKey: EthPrivateKey,
    encryptionKey: string,
  ): Promise<string | undefined>;

  retrieveAndDecryptKey(
    nearAccount: NearAccount,
    nonce?: string,
  ): Promise<EthPrivateKey>;
}
