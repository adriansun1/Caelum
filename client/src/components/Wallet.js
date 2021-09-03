import React from "react";
import styled from "styled-components/macro";

import { useWallet, WalletStatus } from "@terra-money/wallet-provider";

import {
  Button as MuiButton,
  Typography as MuiTypography,
} from "@material-ui/core";
import { spacing } from "@material-ui/system";
import { AccountBalanceWallet } from "@material-ui/icons";

const Button = styled(MuiButton)(spacing);
const Typography = styled(MuiTypography)(spacing);
const Icon = styled(AccountBalanceWallet)`
  margin-right: 4px;
`;

function Wallet() {
  const {
    availableConnectTypes,
    connect,
    disconnect,
    status,
    wallets,
  } = useWallet();

  function handleClick() {
    // maybe expand this to other types
    if (availableConnectTypes.includes("CHROME_EXTENSION")) {
      connect("CHROME_EXTENSION");
    }
  }

  function handleDisconnect() {
    disconnect();
  }

  function shortenAddress(address) {
    return address.slice(0, 8) + "...." + address.slice(-6);
  }

  return (
    <>
      {status === WalletStatus.WALLET_NOT_CONNECTED || wallets.length < 1 ? (
        <Button variant="contained" color="primary" onClick={handleClick}>
          <Icon />
          Connect
        </Button>
      ) : (
        <Button variant="outlined" color="primary" onClick={handleDisconnect}>
          Connected to
          <Typography noWrap ml={1}>
            {shortenAddress(wallets[0].terraAddress)}
          </Typography>
        </Button>
      )}
    </>
  );
}

export default Wallet;
