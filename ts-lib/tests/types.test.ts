import { EthPrivateKey, NearPrivateKey } from "../src/types";

describe("Type Validation", () => {
  it("Validates EthPrivateKey Construction", async () => {
    const validKey =
      "0x38b499b2263de8d23944746a6922757e8da6184828d98fbfd6c88ebee1fad111";
    expect(() => new EthPrivateKey(validKey)).not.toThrow();
    expect(() => new EthPrivateKey("invalid key")).toThrow(
      "Invalid Ethereum private key",
    );
  });

  it("Validates NearPrivateKey Construction", async () => {
    const validKey =
      "ed25519:TxtD94WwG6VRnJbwdhwJX4KASbSXXwovSJ3a6PK8cM63fuWcuXQ4zTTRzSmF2r8Af2bvKWKvNDyfcGRbVXbqCL1";
    expect(() => new NearPrivateKey(validKey)).not.toThrow();
    expect(() => new NearPrivateKey("invalid key")).toThrow(
      "Invalid Near private key",
    );
  });
});
