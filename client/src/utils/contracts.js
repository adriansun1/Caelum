import {
  LCDClient,
  MsgExecuteContract,
  MsgSend,
  StdFee,
  Coin,
} from "@terra-money/terra.js";
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxUnspecifiedError,
  UserDenied,
} from "@terra-money/wallet-provider";

// export const contractAddress = "terra1z330fwm5wayld9f6nsrp3tvvwneaktnerrfmf7";
export const contractAddress = "terra18ajeu3k3ec5j4hzc4ysa53rxn0d9jhnevl58xn";

function handleErrorMessage(error) {
  if (error instanceof UserDenied) {
    return Error("User Denied");
  } else if (error instanceof CreateTxFailed) {
    return Error("Create Tx Failed: " + error.message);
  } else if (error instanceof TxFailed) {
    return Error("Tx Failed: " + error.message);
  } else if (error instanceof Timeout) {
    return Error("Timeout");
  } else if (error instanceof TxUnspecifiedError) {
    return Error("Unspecified Error: " + error.message);
  } else {
    return Error(
      "Unknown Error: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

export async function getMatchup(contract) {
  const terra = new LCDClient({
    chainID: "bombay-10",
    URL: "https://bombay-lcd.terra.dev",
  });

  // { hometeam, awayteam, gamekey, datetime, oracle }
  const result = await terra.wasm.contractQuery(
    contract,
    { get_matchup: {} } // query msg
  );
  return result;
}

export async function getAllBets() {
  const terra = new LCDClient({
    chainID: "bombay-10",
    URL: "https://bombay-lcd.terra.dev",
  });

  const result = await terra.wasm.contractQuery(
    contractAddress,
    { get_all_bets: {} } // query msg
  );
  console.log(result.bets);
  return result.bets;
}

export async function getBetsByOwner(address) {
  const terra = new LCDClient({
    chainID: "bombay-10",
    URL: "https://bombay-lcd.terra.dev",
  });

  const result = await terra.wasm.contractQuery(
    contractAddress,
    { get_bet_by_host: {} } // query msg
  );
  console.log(result.bets);
  return result.bets;
}

export async function claimBet(connectedWallet, host) {
  if (!connectedWallet) {
    return alert("Please connect your wallet first");
  }

  if (connectedWallet.network.chainID.startsWith("columbus")) {
    alert(`Please only execute this example on Testnet`);
    return;
  }

  console.log("what the fuck");
  try {
    // docs suck, no idea how to automatically estimate fee
    const result = await connectedWallet.post({
      fee: new StdFee(1000000, "300000uusd"),
      msgs: [
        new MsgExecuteContract(connectedWallet.walletAddress, contractAddress, {
          claim: {
            host,
          },
        }),
      ],
    });

    return result;
  } catch (error) {
    return handleErrorMessage(error);
  }
}

export async function takeBet(connectedWallet, host, amount, denom) {
  console.log(host, amount, denom);
  if (!connectedWallet) {
    return alert("Please connect your wallet first");
  }

  if (connectedWallet.network.chainID.startsWith("columbus")) {
    alert(`Please only execute this example on Testnet`);
    return;
  }

  try {
    const result = await connectedWallet.post({
      fee: new StdFee(1000000, `${amount}${denom}`),
      msgs: [
        new MsgSend(connectedWallet.walletAddress, contractAddress, {
          [denom]: amount,
        }),
        new MsgExecuteContract(
          connectedWallet.walletAddress,
          contractAddress,
          {
            take_bet: {
              host,
            },
          },
          {
            [denom]: amount,
          }
        ),
      ],
    });

    return result;
  } catch (error) {
    return handleErrorMessage(error);
  }
}

export async function proposeBet(connectedWallet, team, odds, amount, denom) {
  if (!connectedWallet) {
    return alert("Please connect your wallet first");
  }

  if (connectedWallet.network.chainID.startsWith("columbus")) {
    alert(`Please only execute this example on Testnet`);
    return;
  }

  console.log(team, odds, amount, denom);
  try {
    const result = await connectedWallet.post({
      fee: new StdFee(1000000, `${amount}${denom}`),
      msgs: [
        new MsgSend(connectedWallet.walletAddress, contractAddress, {
          [denom]: amount,
        }),
        new MsgExecuteContract(
          connectedWallet.walletAddress,
          contractAddress,
          {
            propose_bet: {
              team,
              odds,
            },
          },
          {
            [denom]: amount,
          }
        ),
      ],
    });
    console.log("result", result);

    return result;
  } catch (error) {
    return handleErrorMessage(error);
  }
}
