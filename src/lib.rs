use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::LookupMap,
    env::{self, log_str},
    near_bindgen, AccountId,
};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct EthKeys {
    // Mapping of account IDs to their respective encrypted keys
    evm_key: LookupMap<AccountId, String>,
}

// Define the default, which automatically initializes the contract
impl Default for EthKeys {
    fn default() -> Self {
        Self {
            evm_key: LookupMap::new("eoa/".as_bytes()),
        }
    }
}

// Implement the contract structure
#[near_bindgen]
impl EthKeys {
    // Sets the encrypted key for the sender's account.
    pub fn set_key(&mut self, encrypted_key: String) {
        // TODO - would be nice if there was some way to validate
        // that the encrypted key actualy contains expected data.
        let account_id = env::signer_account_id();
        self.evm_key.insert(&account_id, &encrypted_key);
        log_str(&format!("SetKey({account_id})"));
    }

    pub fn get_key(&self, account_id: AccountId) -> Option<String> {
        self.evm_key.get(&account_id)
    }
}

#[cfg(test)]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, AccountId, VMContext};

    use crate::EthKeys;

    fn get_context(signer_account_id: AccountId) -> VMContext {
        VMContextBuilder::new()
            .signer_account_id(signer_account_id)
            .build()
    }

    #[test]
    fn test_get_key_default() {
        let contract = EthKeys::default();
        let key = contract.get_key(accounts(1));
        assert!(key.is_none());
    }

    #[test]
    fn test_set_key() {
        let signer = accounts(1);
        let context = get_context(signer.clone());
        let mut contract = EthKeys::default();
        testing_env!(context);

        let encrypted_key = "my_encrypted_key".to_string();

        contract.set_key(encrypted_key.clone());

        let retrieved_key = contract.get_key(signer).unwrap();

        assert_eq!(retrieved_key, encrypted_key);
    }
}
