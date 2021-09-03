use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Addr,Coin};
use cw_storage_plus::{Item, Map};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum Team {
    Home,
    Away,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum GameResult {
    HomeWins,
    AwayWins,
    Tie
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub gamekey: u32,
    pub datetime: String,
    pub hometeam: String,
    pub awayteam: String,
    pub oracle: Addr,
    pub admin: Addr
}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, JsonSchema)]
pub struct Data {
    pub host: Addr,
    pub team: Team,
    pub odds: i16,
    pub amount: Coin,
    pub match_amount: Coin,
    pub matcher: Option<Addr>,
}

pub const STATE: Item<State> = Item::new("state");
pub const BETS: Map<Addr, Data> = Map::new("bets");
