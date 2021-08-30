use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("No funds")]
    Nofunds {},

    #[error("Multiple funds sent")]
    Multiplefunds {},

    #[error("Funds do not match")]
    Unmatchedfunds {}
    // Add any other custom errors you like here.
    // Look at https://docs.rs/thiserror/1.0.21/thiserror/ for details.
}
