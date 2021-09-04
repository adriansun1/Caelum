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
    Unmatchedfunds {},

    #[error("Contract must have an admin")]
    Noadmin {},

    #[error("A bet may only be matched by one party")]
    MultipleMatches {},

    #[error("User has no claim on this bet")]
    Noclaim {}
    // Add any other custom errors you like here.
    // Look at https://docs.rs/thiserror/1.0.21/thiserror/ for details.
}
