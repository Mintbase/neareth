use near_workspaces::{types::NearToken, Account, Contract};
use serde_json::json;
use std::{env, fs};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let wasm_arg: &str = &(env::args().nth(1).unwrap());
    let wasm_filepath = fs::canonicalize(env::current_dir()?.join(wasm_arg))?;
    let worker = near_workspaces::sandbox().await?;
    let wasm = std::fs::read(wasm_filepath)?;
    let contract = worker.dev_deploy(&wasm).await?;

    // create accounts
    let account = worker.dev_create_account().await?;
    let alice = account
        .create_subaccount("alice")
        .initial_balance(NearToken::from_near(30))
        .transact()
        .await?
        .into_result()?;
    let bob = account
        .create_subaccount("bob")
        .initial_balance(NearToken::from_near(30))
        .transact()
        .await?
        .into_result()?;

    // begin tests
    test_set_get_key(&alice, &bob, &contract).await?;
    Ok(())
}

async fn test_set_get_key(
    alice: &Account,
    bob: &Account,
    contract: &Contract,
) -> Result<(), Box<dyn std::error::Error>> {
    let key_before: Option<String> = alice
        .call(contract.id(), "get_key")
        .args_json(json!({"account_id": alice.id()}))
        .transact()
        .await?
        .json()?;
    assert!(key_before.is_none());

    let encrypted_key = "my_encrypted_key".to_string();
    let tx = alice
        .call(contract.id(), "set_key")
        .args_json(json!({"encrypted_key": encrypted_key, "overwrite": false}))
        .transact()
        .await?;
    assert!(tx.is_success());

    let key_after: Option<String> = alice
        .call(contract.id(), "get_key")
        .args_json(json!({"account_id": alice.id()}))
        .transact()
        .await?
        .json()?;

    assert_eq!(key_after, Some(encrypted_key.clone()));

    // anyone can read Alice's (encrypted) key:
    let key_after: Option<String> = bob
        .call(contract.id(), "get_key")
        .args_json(json!({"account_id": alice.id()}))
        .transact()
        .await?
        .json()?;
    assert_eq!(key_after, Some(encrypted_key));
    println!("      Passed ✅ gets default test_set_get_key");
    Ok(())
}
