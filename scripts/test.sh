#!/bin/sh

# unit testing
cargo test

# sandbox testing
./scripts/build.sh
cd sandbox-rs
cargo run --example sandbox "../target/wasm32-unknown-unknown/release/neareth.wasm"