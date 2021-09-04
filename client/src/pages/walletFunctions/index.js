import React, { useState } from "react";
import styled from "styled-components/macro";

import { Helmet } from "react-helmet-async";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider as MuiDivider,
  Grid,
  Snackbar,
  IconButton,
  Typography as MuiTypography,
} from "@material-ui/core";

import { Close as CloseIcon } from "@material-ui/icons";

import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxUnspecifiedError,
  useConnectedWallet,
  UserDenied,
} from "@terra-money/wallet-provider";
import { MsgSend, StdFee } from "@terra-money/terra.js";
import { contractAddress } from "../../utils/contracts";

import Wallet from "../../components/Wallet";

import { spacing } from "@material-ui/system";
import DisplayContracts from "../../components/DisplayContracts";
import CreateContract from "../../components/CreateContract";

const Divider = styled(MuiDivider)(spacing);

const Typography = styled(MuiTypography)(spacing);

function WalletFunctions() {
  const connectedWallet = useConnectedWallet();
  const [txResult, setTxResult] = useState(null);
  const [txError, setTxError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  async function handleSend() {
    const toAddress = "terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9";

    if (!connectedWallet) {
      return alert("Please connect your wallet first");
    }

    if (connectedWallet.network.chainID.startsWith("columbus")) {
      alert(`Please only execute this example on Testnet`);
      return;
    }

    setTxResult(null);

    connectedWallet
      .post({
        fee: new StdFee(1000000, "200000uusd"),
        msgs: [
          new MsgSend(connectedWallet.walletAddress, toAddress, {
            uusd: 1000000,
          }),
        ],
      })
      .then((nextTxResult) => {
        setTxResult(nextTxResult);
        setOpen(true);
      })
      .catch((error) => {
        if (error instanceof UserDenied) {
          setTxError("User Denied");
        } else if (error instanceof CreateTxFailed) {
          setTxError("Create Tx Failed: " + error.message);
        } else if (error instanceof TxFailed) {
          setTxError("Tx Failed: " + error.message);
        } else if (error instanceof Timeout) {
          setTxError("Timeout");
        } else if (error instanceof TxUnspecifiedError) {
          setTxError("Unspecified Error: " + error.message);
        } else {
          setTxError(
            "Unknown Error: " +
              (error instanceof Error ? error.message : String(error))
          );
        }
      });
  }

  return (
    <React.Fragment>
      <Helmet title="Events" />

      <Typography variant="h4" gutterBottom display="inline">
        Wallet Functionality
      </Typography>

      <Divider my={2} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h3" my={4}>
                Connect Button
              </Typography>
              <Box component="span" mx={3}>
                <Wallet />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h3" my={4}>
                Send and Receive
              </Typography>

              <Box component="span" mx={3}>
                <Button
                  mx={3}
                  variant="contained"
                  color="primary"
                  onClick={handleSend}
                >
                  Send
                </Button>
              </Box>
              <Box component="span" mx={3}>
                <Button variant="contained">Receive</Button>
              </Box>
              <Snackbar
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={`Successfully sent ${txResult?.msgs[0]?.amount?._coins?.uusd.toString()}`}
                action={
                  <React.Fragment>
                    <IconButton
                      size="small"
                      aria-label="close"
                      color="inherit"
                      onClick={handleClose}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </React.Fragment>
                }
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" my={4}>
                Take Bets
              </Typography>
              <DisplayContracts contract={contractAddress} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" my={4}>
                Create Bets
              </Typography>
              <CreateContract />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default WalletFunctions;
