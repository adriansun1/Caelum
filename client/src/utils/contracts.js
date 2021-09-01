import {
  LCDClient,
  MsgExecuteContract,
  MsgSend,
  StdFee,
} from "@terra-money/terra.js";
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxUnspecifiedError,
  UserDenied,
} from "@terra-money/wallet-provider";

const contractAddress = "terra15gh7jw4ywqe936dzgn8czyyzlmu2x5wt5l7wxg";

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

export async function takeBet(connectedWallet, host, amount, denom) {
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
    console.log(error);
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
}

export async function createBet(connectedWallet, team, odds, amount, denom) {
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
    console.log(error);
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
}
