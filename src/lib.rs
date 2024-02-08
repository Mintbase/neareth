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

impl Default for EthKeys {
    fn default() -> Self {
        Self {
            evm_key: LookupMap::new("eoa/".as_bytes()),
        }
    }
}

#[near_bindgen]
impl EthKeys {
    // Sets the encrypted key for the sender's account.
    pub fn set_key(&mut self, encrypted_key: String, overwrite: Option<bool>) -> Option<String> {
        if env::predecessor_account_id() != env::signer_account_id() {
            println!(
                "predecessor {:?} != signer {:?}",
                env::predecessor_account_id(),
                env::signer_account_id()
            );
            env::panic_str("key can only be set directly by the account owner.");
        }

        let overwrite = if let Some(provided_flag) = overwrite {
            provided_flag
        } else {
            false
        };
        // TODO - would be nice if there was some way to validate
        // that the encrypted key actualy contains expected data.
        let account_id = env::signer_account_id();
        let result = match self.evm_key.insert(&account_id, &encrypted_key) {
            Some(old_encrypted_key) => {
                if !overwrite {
                    env::panic_str("Key already set!");
                }
                Some(old_encrypted_key)
            }
            None => None,
        };
        log_str(&format!("SetKey({account_id}, {encrypted_key})"));
        result
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
            .signer_account_id(signer_account_id.clone())
            .predecessor_account_id(signer_account_id)
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

        let res = contract.set_key(encrypted_key.clone(), None);
        assert_eq!(res, None);

        let retrieved_key = contract.get_key(signer);
        assert_eq!(Some(encrypted_key), retrieved_key);
    }

    #[test]
    #[should_panic]
    fn test_set_key_overwrite_failure() {
        let signer = accounts(1);
        let context = get_context(signer.clone());
        let mut contract = EthKeys::default();
        testing_env!(context);

        contract.set_key("old_key".into(), None);
        contract.set_key("new_key".into(), None);
    }

    #[test]
    fn test_set_key_overwrite_passes() {
        let signer = accounts(1);
        let context = get_context(signer.clone());
        let mut contract = EthKeys::default();
        testing_env!(context);
        let old_key = "old_key".to_string();
        contract.set_key(old_key.clone(), None);
        let reset_result = contract.set_key("new_key".into(), Some(true));
        assert_eq!(reset_result, Some(old_key));
    }

    #[test]
    #[should_panic(expected = "key can only be set directly by the account owner.")]
    fn test_set_key_direct_calls_only() {
        // Set invalid context.
        let context = VMContextBuilder::new()
            .signer_account_id(accounts(1))
            .predecessor_account_id(accounts(2))
            .build();
        let mut contract = EthKeys::default();
        testing_env!(context);
        contract.set_key("super key".into(), Some(true));
    }
}
