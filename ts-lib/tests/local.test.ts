import { Worker, NearAccount } from "near-workspaces";

describe("EthKeys contract tests", () => {
  let worker: Worker;
  let user: NearAccount;
  let contract: NearAccount;

  beforeEach(async () => {
    // Init the worker and start a Sandbox server
    worker = await Worker.init();

    // Deploy contract
    user = worker.rootAccount;
    contract = await user.createSubAccount("test-account");

    // Get wasm file path from package.json test script in folder above
    const wasmFilePath = "../target/wasm32-unknown-unknown/debug/neareth.wasm";
    await contract.deploy(wasmFilePath);
  });
  afterEach(async () => {
    // Stop Sandbox server
    await worker.tearDown();
  });

  it("get_key", async () => {
    const key = await contract.view("get_key", { account_id: user.accountId });
    expect(key).toBe(null);
  });
  it("set_key", async () => {
    const value = "Howdy";
    await user.call(contract, "set_key", {
      encrypted_key: value,
      overwrite: false,
    });
    const key = await contract.view("get_key", { account_id: user.accountId });
    expect(key).toBe(value);
  });
  it("manual overwrite", async () => {
    const value = "Howdy";
    await user.call(contract, "set_key", {
      encrypted_key: value,
      overwrite: false,
    });
    let key = await contract.view("get_key", { account_id: user.accountId });
    expect(key).toBe(value);

    const newValue = "Doody";
    await user.call(contract, "set_key", {
      encrypted_key: newValue,
      overwrite: false,
    });
    key = await contract.view("get_key", { account_id: user.accountId });
    expect(key).toBe(value);

    await user.call(contract, "set_key", {
      encrypted_key: newValue,
      overwrite: true,
    });
    key = await contract.view("get_key", { account_id: user.accountId });
    expect(key).toBe(newValue);
  });
});
