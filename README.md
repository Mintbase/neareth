# NEAR-ETH Contracts

The smart contract exposes two methods to enable storing and retrieving an encrypted (key, value)

Credentials for existing testnet deployment are available in [1Pass](https://start.1password.com/open/i?a=ZIJJEHVWG5B65JZQXIVTX6W6QA&v=vjvb57zjcelqbcgou3hy2vdjr4&i=tih4cuzpemakxxvyakbhwbzdja&h=mintbase.1password.com)


## 1. Build, Test and Deploy
To build the contract you can execute the `./build.sh` script, which will in turn run:

Then, run the `./deploy.sh` script, which will in turn run:

```bash
near dev-deploy --wasmFile ./target/wasm32-unknown-unknown/release/hello_near.wasm
```

the command [`near dev-deploy`](https://docs.near.org/tools/near-cli#near-dev-deploy) automatically creates an account in the NEAR testnet, and deploys the compiled contract on it.

Once finished, check the `./neardev/dev-account` file to find the address in which the contract was deployed:

```bash
cat ./neardev/dev-account
```

## 2. Retrieve an Existing Key (View)

```bash
# Use near-cli to get the key
near view <dev-account> get_key '{"account_id": <SOME_ACCOUNT>}'
```

## 3. Store a New Key (Change)
`set_key` changes the contract's state, for which it is a `change` method.

```bash
# Use near-cli to set a new key
near call <dev-account> set_key '{"encrypted_key": "whateva"}' --accountId <dev-account>
```

**Tip:** If you would like to call `set_key` using your own account, first login into NEAR using:

```bash
# Use near-cli to login your NEAR account
near login
```

and then use the logged account to sign the transaction: `--accountId <your-account>`.