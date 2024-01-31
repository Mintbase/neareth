// TODO - can validate whether key provided can actually control accountId
//  however, it requires calls to near.
export interface NearAccount {
  accountId: string;
  privateKey: NearPrivateKey;
}

export class EthPrivateKey {
  private key: string;

  constructor(key: string) {
    if (!this.isValidEthPrivateKey(key)) {
      throw new Error("Invalid Ethereum private key");
    }
    this.key = key;
  }

  private isValidEthPrivateKey(key: string): boolean {
    const hexRegex = /^[a-fA-F0-9]{64}$/;
    return (
      typeof key === "string" &&
      hexRegex.test(key.startsWith("0x") ? key.slice(2) : key)
    );
  }

  toString(): string {
    return this.key;
  }
}

export class NearPrivateKey {
  private key: string;

  constructor(key: string) {
    if (!this.isNearPrivateKey(key)) {
      throw new Error("Invalid Ethereum private key");
    }
    this.key = key;
  }

  private isNearPrivateKey(key: any): boolean {
    const prefix = "ed25519:";
    // Base58 regex excluding 0, O, I, and l
    const base58Regex = /^[A-HJ-NP-Za-km-z1-9]+$/;

    if (typeof key !== "string" || !key.startsWith(prefix)) {
      return false;
    }

    const keyPart = key.substring(prefix.length);
    return base58Regex.test(keyPart);
  }

  toString(): string {
    return this.key;
  }
}
