#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{Uint128, Coin};
use cosmwasm_std::{Deps, DepsMut, Env, Addr, MessageInfo};
use cosmwasm_std::{Response, StdResult, StdError};
use cosmwasm_std::{to_binary, Binary, Order};
use cosmwasm_std::{CosmosMsg, SubMsg, BankMsg, attr};
use crate::error::ContractError;
use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg};
use crate::msg::{AdminResponse, BetsResponse, MatchupResponse};
use crate::state::{STATE, BETS, State, Data, Team, GameResult};

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(mut deps: DepsMut, _env: Env, info: MessageInfo, msg: InstantiateMsg,)
-> Result<Response, ContractError> {
    // Instantiate a contract for a single matchup
    // Contract admin is the sender of this transaction
    // Oracle must be declared at instantiation
    // Anyone may propose bets after intantiation
    let checked = deps.api.addr_validate(&msg.oracle)?;
    let state = State {
        gamekey: msg.gamekey,
        datetime: msg.datetime,
        oracle: checked,
        hometeam: msg.hometeam,
        awayteam: msg.awayteam,
        admin: info.sender.clone()
    };
    STATE.save(deps.storage, &state)?;
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", info.sender))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(deps: DepsMut, _env: Env, info: MessageInfo, msg: ExecuteMsg)
-> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::ProposeBet { team, odds }
            => propose_bet(deps, info, team, odds),
        ExecuteMsg::TakeBet { host }
            => take_bet(deps, info, host),
        ExecuteMsg::SettleUp { homeScore, awayScore }
            => settle_up(deps, info, homeScore, awayScore),
    }
}
pub fn calc_match_amount(wager: Uint128, &odds: &i16) -> Uint128 {
    // find the amount needed to match a proposed bet
    let payout = if odds < 0 {
        let factor = wager.u128() / odds.abs() as u128;
        100 as u128 * factor
    } else {
        let factor = wager.u128() / 100 as u128;
        odds as u128 * factor
    };
    Uint128::new(payout as u128)
}
pub fn propose_bet(deps: DepsMut, info: MessageInfo, team: String, odds: i16)
-> Result<Response, ContractError> {
    // check that proposal does not exist, only one per host may exist
    let empty = BETS.load(deps.storage, info.sender.clone());
    match empty {
        Ok(_d) => return Err(ContractError::Unauthorized {}),
        Err(_e) => ()
    }
    // get funds attached to MSG
    let coins = info.funds.clone();
    match coins.clone().len() {
        0 => return Err(ContractError::Nofunds {}),
        1 => (),
        _ => return Err(ContractError::Multiplefunds {}),
    };
    // store proposal in BETS, at self selected odds for the wager amount
    let data = Data {
        host: info.sender.clone(),
        team: if team == "home" { Team::Home } else { Team::Away },
        odds: odds,
        amount: coins[0].clone(),
        match_amount: Coin {
            amount: calc_match_amount(coins[0].clone().amount, &odds),
            denom: coins[0].clone().denom
        },
        matcher: None
    };
    BETS.save(deps.storage, data.host.clone(), &data)?;
    Ok(Response::new().add_attribute("method", "propose_bet"))
}
pub fn take_bet(deps: DepsMut, info: MessageInfo, host: String )
-> Result<Response, ContractError> {
    let checked = deps.api.addr_validate(&host)?;
    let data = BETS.load(deps.storage, checked.clone())?;
    if data.matcher != None { return Err(ContractError::MultipleMatches {})}
    // get funds attached to MSG
    let coins = info.funds.clone();
    match coins.clone().len() {
        0 => return Err(ContractError::Nofunds {}),
        1 => (),
        _ => return Err(ContractError::Multiplefunds {}),
    }
    // reject if funds do not match wager
    if data.match_amount != coins[0] {
        return Err(ContractError::Unmatchedfunds {})
    }
    // prepare data struct
    let data = Data {
        host: checked.clone(),
        team: data.team,
        odds: data.odds,
        amount: data.amount.clone(),
        match_amount: Coin {
            amount: calc_match_amount(data.amount.clone().amount, &data.odds),
            denom: data.amount.clone().denom
        },
        matcher: Some(info.sender.clone()),
    };
    // update BETS with matcher
    BETS.save(deps.storage, checked, &data)?;
    Ok(Response::new().add_attribute("method", "take_bet"))
    }

pub fn determine_victor( homeScore: i16, awayScore: i16 ) -> GameResult {
    let result: GameResult = if homeScore > awayScore {
        GameResult::HomeWins
    } else if homeScore < awayScore {
        GameResult::AwayWins
    } else {
        GameResult::Tie
    };
    result
}
fn send_tokens(to_address: Addr, amount: Vec<Coin>) -> Result<Response, StdError> {
    let msg = BankMsg::Send{
        to_address: to_address.to_string(),
        amount: amount.clone()
    };
    Ok(Response::new().add_message(msg).add_attribute("method","payout"))
}
fn pay_out(deps: DepsMut, result: GameResult) -> Result<(),StdError> {
    let all: StdResult<Vec<_>> = BETS
        .range(deps.storage, None, None, Order::Ascending)
        .collect();
    for (_key, data) in all? {
        match data.matcher {
            None => {
                send_tokens(data.host.clone(), vec![data.amount]);
                ()
            },
            Some(matcher) => {
                match &result {
                    HomeWins => {
                        match data.team {
                            Home => {
                                send_tokens(data.host.clone(),vec![data.amount,data.match_amount]);
                                ()
                            },
                            Away => {
                                send_tokens(matcher,vec![data.amount,data.match_amount]);
                                ()
                            },
                        };
                        ()
                    },
                    AwayWins => {
                        match data.team {
                            Away => {
                                send_tokens(data.host.clone(),vec![data.amount,data.match_amount]);
                                ()
                            },
                            Home => {
                                send_tokens(matcher,vec![data.amount,data.match_amount]);
                                ()
                            },
                        };
                        ()
                    },
                    Tie => {
                        // return deposits to data.host and data.matcher
                        send_tokens(data.host.clone(),vec![data.amount]);
                        send_tokens(matcher,vec![data.match_amount]);
                        ()
                    },
                };
            },
        };
        BETS.remove(deps.storage, data.host);
    };
    Ok(())
}
pub fn settle_up(deps: DepsMut, info: MessageInfo, homeScore: i16, awayScore: i16 )
-> Result<Response, ContractError> {
    // PLACEHOLDER
    // check that sender is Oracle or Admin
    let state = STATE.load(deps.storage)?;
    if state.admin != info.sender {
        return Err(ContractError::Unauthorized {})
    } else {
        let result = determine_victor(homeScore, awayScore);
        pay_out(deps, result);
    };
    Ok(Response::new().add_attribute("method", "settle_up"))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg ) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetAllBets {} => to_binary(&query_bets(deps)?),
        QueryMsg::GetUnmatchedBets {} => to_binary(&query_unmatched(deps)?),
        QueryMsg::GetMatchedBets {} => to_binary(&query_matched(deps)?),
        QueryMsg::GetBetByHost { host } => to_binary(&query_host(deps, host)?),
        QueryMsg::GetBetsByOpp { opponent } => to_binary(&query_opp(deps, opponent)?),
        QueryMsg::GetAdmin {} => to_binary(&query_admin(deps)?),
        QueryMsg::GetMatchup {} => to_binary(&query_state(deps)?),
    }
}
fn bets_to_vec(deps: Deps) -> Result<Vec<Data>, StdError> {
    let all: StdResult<Vec<_>> = BETS
        .range(deps.storage, None, None, Order::Ascending)
        .collect();
    let mut results: Vec<Data> = Vec::new();
    for (_key, data) in all? { results.push(data); };
    return Ok(results)
}
fn query_state(deps: Deps) -> Result<MatchupResponse, StdError> {
    let state = STATE.load(deps.storage)?;
    return Ok(MatchupResponse{
        gamekey: state.gamekey,
        hometeam: state.hometeam,
        awayteam: state.awayteam,
        datetime: state.datetime,
        oracle: state.oracle,
    })
}
fn query_bets(deps: Deps) -> Result<BetsResponse, StdError> {
    let all: Vec<Data> = bets_to_vec(deps)?;
    let mut results: Vec<Data> = Vec::new();
    for data in all { results.push(data) };
    return Ok(BetsResponse{ bets: results })
}
fn query_unmatched(deps: Deps) -> Result<BetsResponse, StdError> {
    let all: Vec<Data> = bets_to_vec(deps)?;
    let mut results: Vec<Data> = Vec::new();
    for data in all {
        if data.matcher == None {
            results.push(data);
        };
    };
    return Ok(BetsResponse{ bets: results })
}
fn query_matched(deps: Deps) -> Result<BetsResponse, StdError> {
    let all: Vec<Data> = bets_to_vec(deps)?;
    let mut results: Vec<Data> = Vec::new();
    for data in all {
        if data.matcher != None {
            results.push(data);
        };
    };
    return Ok(BetsResponse{ bets: results })
}
fn query_host(deps: Deps, host: String) -> Result<BetsResponse, StdError> {
    let checked = deps.api.addr_validate(&host)?;
    let data = BETS.load(deps.storage, checked.clone())?;
    let mut result: Vec<Data> = Vec::new();
    result.push(data);
    return Ok(BetsResponse{ bets: result })
}
fn query_opp(deps: Deps, opponent: String) -> Result<BetsResponse, StdError> {
    let checked = deps.api.addr_validate(&opponent)?;
    let all: Vec<Data> = bets_to_vec(deps)?;
    let mut results: Vec<Data> = Vec::new();
    for data in all {
        if data.matcher == Some(checked.clone()) { results.push(data); }
    };
    return Ok(BetsResponse{ bets: results })
}
fn query_admin(deps: Deps ) -> Result<AdminResponse, StdError> {
    let state = STATE.load(deps.storage)?;
    Ok(AdminResponse{ admin: state.admin })
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info, BankQuerier};
    use cosmwasm_std::{coins, Coin, Addr, QuerierWrapper};
    use cosmwasm_std::Uint128;
    use cosmwasm_std::from_binary;

    #[test]
    fn test_initialize() {
        let mut deps = mock_dependencies(&[]);
        let info = mock_info("creator", &coins(1000, "earth"));
        let msg = InstantiateMsg {
            gamekey: 202110133 as u32,
            datetime: "2021-09-09T20:20:00".to_string(),
            hometeam: "TB".to_string(),
            awayteam: "DAL".to_string(),
            oracle: "Oracle Addr".to_string(),
        };
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());

        // query administrator
        let msg = QueryMsg::GetAdmin {};
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let value: AdminResponse = from_binary(&res).unwrap();
        assert_eq!(Addr::unchecked("creator"),value.admin);

        // query BETS
        let msg = QueryMsg::GetAllBets {};
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let value: BetsResponse = from_binary(&res).unwrap();
        let empty: Vec<Data> = Vec::new();
        assert_eq!(empty,value.bets);

    }

    #[test]
    fn test_propose() {
        let mut deps = mock_dependencies(&[]);
        test_initialize();

        // Propose a bet
        let info = mock_info("bob", &coins(300, "token".to_string()));
        let msg = ExecuteMsg::ProposeBet {
            team: "home".to_string(),
            odds: -150,
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Query BETS by host
        let msg = QueryMsg::GetBetByHost { host: "bob".to_string() };
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let value: BetsResponse = from_binary(&res).unwrap();
        let test_data = Data {
            host: Addr::unchecked("bob"),
            team: Team::Home,
            odds: -150,
            amount: Coin{ amount: Uint128::new(300), denom: "token".to_string()},
            match_amount: Coin {
                amount: Uint128::new(200), // should be 150
                denom: "token".to_string()
            },
            matcher: None,
        };
        let mut test_vec: Vec<Data> = Vec::new();
        test_vec.push(test_data);
        assert_eq!(test_vec,value.bets);

        // Query unmatched BETS
        let msg = QueryMsg::GetUnmatchedBets {};
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let value: BetsResponse = from_binary(&res).unwrap();
        let test_data = Data {
            host: Addr::unchecked("bob"),
            team: Team::Home,
            odds: -150,
            amount: Coin{ amount: Uint128::new(300), denom: "token".to_string()},
            match_amount: Coin {
                amount: Uint128::new(200), // should be 150
                denom: "token".to_string()
            },
            matcher: None,
        };
        let mut test_vec: Vec<Data> = Vec::new();
        test_vec.push(test_data);
        assert_eq!(test_vec,value.bets);
    }

    #[test]
    fn test_match() {
        let mut deps = mock_dependencies(&[]);
        test_initialize();

        // Propose a bet
        let info = mock_info("bob", &coins(300, "token".to_string()));
        let msg = ExecuteMsg::ProposeBet {
            team: "home".to_string(),
            odds: -150,
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Match bet
        let info = mock_info("alice", &coins(200, "token".to_string()));
        let msg = ExecuteMsg::TakeBet {
            host: "bob".to_string()
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Query matched BETS
        let msg = QueryMsg::GetMatchedBets {};
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let value: BetsResponse = from_binary(&res).unwrap();
        let test_data = Data {
            host: Addr::unchecked("bob"),
            team: Team::Home,
            odds: -150,
            amount: Coin{ amount: Uint128::new(300), denom: "token".to_string()},
            match_amount: Coin {
                amount: Uint128::new(200), // should be 150
                denom: "token".to_string()
            },
            matcher: Some(Addr::unchecked("alice")),
        };
        let mut test_vec: Vec<Data> = Vec::new();
        test_vec.push(test_data);
        assert_eq!(test_vec,value.bets);

        // Match bet twice (error)
        let info = mock_info("charlie", &coins(200, "token".to_string()));
        let msg = ExecuteMsg::TakeBet {
            host: "bob".to_string()
        };
        let res = execute(deps.as_mut(), mock_env(), info, msg);
        match res {
            Ok(_m) => panic!("Bet matched twice should throw error"),
            Err(_e) => ()
        };
    }

    #[test]
    fn test_settle() {
        let mut deps = mock_dependencies(&[]);
        let mut deps = mock_dependencies(&[]);
        let info = mock_info("creator", &coins(1000, "earth"));
        let msg = InstantiateMsg {
            gamekey: 202110133 as u32,
            datetime: "2021-09-09T20:20:00".to_string(),
            hometeam: "TB".to_string(),
            awayteam: "DAL".to_string(),
            oracle: "Oracle Addr".to_string(),
        };
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());

        // Propose a bet
        let info = mock_info("bob", &coins(300, "token".to_string()));
        let msg = ExecuteMsg::ProposeBet {
            team: "home".to_string(),
            odds: -150,
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Match bet
        let info = mock_info("alice", &coins(200, "token".to_string()));
        let msg = ExecuteMsg::TakeBet {
            host: "bob".to_string()
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // query administrator
        let msg = QueryMsg::GetAdmin {};
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let value: AdminResponse = from_binary(&res).unwrap();
        assert_eq!(Addr::unchecked("creator"),value.admin);

        // Settle up
        let info = mock_info("creator", &coins(0,"token".to_string()));
        let msg = ExecuteMsg::SettleUp {
            homeScore: 21,
            awayScore: 7,
        };
        let res = execute(deps.as_mut(), mock_env().clone(), info, msg);

        // query BETS
        let msg = QueryMsg::GetAllBets {};
        let res = query(deps.as_ref(), mock_env(), msg).unwrap();
        let value: BetsResponse = from_binary(&res).unwrap();
        let empty: Vec<Data> = Vec::new();
        assert_eq!(empty,value.bets);
    }
    /*
    #[test]
    fn test_settle_up() {
        let mut deps = mock_dependencies(&[]);
        test_initialize();

        // Propose a bet
        let info = mock_info("bob", &coins(300, "UST".to_string()));
        let msg = ExecuteMsg::ProposeBet {
            team: "home".to_string(),
            odds: -150,
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Match bet
        let info = mock_info("alice", &coins(200, "UST".to_string()));
        let msg = ExecuteMsg::TakeBet {
            host: "bob".to_string()
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Settle up
        let info = mock_info("creator", &coins(0,"token".to_string()));
        let msg = ExecuteMsg::SettleUp {
            homeScore: 21,
            awayScore: 7,
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg);

    }
    */
}
