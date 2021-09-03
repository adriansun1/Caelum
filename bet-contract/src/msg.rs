use cosmwasm_std::Addr;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use crate::state::Data;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub hometeam: String,
    pub awayteam: String,
    pub oracle: String,
    pub datetime: String,
    pub gamekey: u32
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    ProposeBet { team: String, odds: i16 },
    TakeBet { host: String },
    SettleUp { homeScore: i16, awayScore: i16 },
}

// QUERY MSG
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    GetAllBets {},
    GetMatchedBets {},
    GetUnmatchedBets {},
    GetBetByHost { host: String },
    GetBetsByOpp { opponent: String },
    GetAdmin {},
    GetMatchup {},
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct BetsResponse {
     pub bets: Vec<Data>
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct AdminResponse {
    pub admin: Addr
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MatchupResponse {
    pub gamekey: u32,
    pub hometeam: String,
    pub awayteam: String,
    pub datetime: String,
    pub oracle: Addr
}
