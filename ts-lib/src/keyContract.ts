import { Account, Contract } from "near-api-js";

export interface IKeyContract {
  set_key: (args: { encrypted_key: string }) => Promise<void>;
  get_key: (args: { account_id: string }) => Promise<string | null>;
}

export class KeyContract {
  // Contract method interface
  methods: IKeyContract;
  // Connected Account
  account: Account;

  /**
   * Constructs an instance of a connected KeyContract
   * @param contractId - Account ID of deployed contract.
   * @param account - Near Account to sign change method transactions.
   */
  constructor(contractId: string, account: Account) {
    this.account = account;
    this.methods = new Contract(account, contractId, {
      viewMethods: ["get_key"],
      changeMethods: ["set_key"],
      useLocalViewExecution: false,
    }) as unknown as IKeyContract;
  }
}
