import { EthPrivateKey, NearAccount } from "../types";

export interface EthKeyManager {
  /**
   *
   * @param ethPrivateKey - Ethereum Private Key to be stored on key contract.
   * @param encryptionKey - Secret key of for encryption.
   * @param overwrite - Whether the key should be overwritten if already set.
   * @returns Nonce if needed decrypt encoded key, otherwise nothing.
   */
  encryptAndSetKey(
    ethPrivateKey: EthPrivateKey,
    encryptionKey: string,
    overwrite?: boolean,
  ): Promise<string | undefined>;

  retrieveAndDecryptKey(
    nearAccount: NearAccount,
    nonce?: string,
  ): Promise<EthPrivateKey>;
}
