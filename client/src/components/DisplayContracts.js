import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import {
  getAllBets,
  getMatchup,
  takeBet,
  claimBet,
  getBetsByOwner,
} from "../utils/contracts";

import {
  IconButton,
  Box,
  Card as MuiCard,
  Chip as MuiChip,
  Divider as MuiDivider,
  Grid,
  Typography as MuiTypography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";

import { Refresh } from "@material-ui/icons";
import { convertUusdToUst } from "../utils/conversions";
import { spacing } from "@material-ui/system";
import { useConnectedWallet } from "@terra-money/wallet-provider";
import { mapTeam } from "../utils/mapTeam";
import { green } from "@material-ui/core/colors";

const SpacedChip = styled(MuiChip)(spacing);
const Card = styled(MuiCard)(spacing);
const SpacedTypography = styled(MuiTypography)(spacing);
const Typography = styled(SpacedTypography)`
  width: 100%;
`;
const Divider = styled(MuiDivider)(spacing);
const Chip = styled(SpacedChip)`
  background-color: ${(props) => props.rgbcolor};
  color: ${(props) => props.theme.palette.common.white};
`;

export default function DisplayContracts({ title, contract, owner }) {
  const [allBets, setAllBets] = useState([]);
  const [teams, setTeams] = useState([]);
  const connectedWallet = useConnectedWallet();

  useEffect(() => {
    const fetchData = async () => {
      const { hometeam, awayteam } = await getMatchup(contract);
      setTeams([hometeam, awayteam]);

      let allBets;
      if (owner) {
        if (connectedWallet) {
          allBets = await getBetsByOwner(connectedWallet?.walletAddress);
        } else {
          return;
        }
      } else {
        allBets = await getAllBets();
      }
      setAllBets(allBets);
      console.log("allbets", allBets);
    };
    fetchData();
  }, [contract, connectedWallet, owner]);

  async function refreshBets() {
    const { hometeam, awayteam } = await getMatchup(contract);
    setTeams([hometeam, awayteam]);

    let allBets;
    if (owner) {
      if (connectedWallet) {
        allBets = await getBetsByOwner(connectedWallet?.walletAddress);
      } else {
        return;
      }
    } else {
      allBets = await getAllBets();
    }
    setAllBets(allBets);
    console.log("allbets", allBets);
  }

  function getWinnerAddress(winner, matcher, host) {
    if (winner === "MatcherWins") {
      return matcher;
    }
    return host;
  }

  return (
    <Box my={4}>
      <Box justifyContent="space-between" display="flex" alignItems="center">
        <Typography variant="h4" gutterBottom display="inline">
          {title}
        </Typography>

        <IconButton color="inherit" aria-label="refresh" onClick={refreshBets}>
          <Refresh />
        </IconButton>
      </Box>

      <Divider my={2} />

      <Card mb={6}>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bet Creator</TableCell>
                <TableCell align="center">Match</TableCell>
                <TableCell align="center">Team</TableCell>
                <TableCell align="center">Odds</TableCell>
                <TableCell align="center">Risk</TableCell>
                <TableCell align="center">To Win</TableCell>
                <TableCell align="center">Available?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allBets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Typography variant="h4" align="center" padding={8}>
                      No bets placed
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {allBets.map(
                ({
                  host,
                  team,
                  odds,
                  amount,
                  match_amount,
                  matcher,
                  winner,
                }) => {
                  return (
                    <TableRow key={`${host}_${amount.amount}`}>
                      <TableCell>{host}</TableCell>
                      <TableCell align="center" component="th" scope="row">
                        <Grid container direction="column">
                          <Grid item>{mapTeam(teams[0])}</Grid>
                          <Divider />
                          <Grid item>{mapTeam(teams[1])}</Grid>
                        </Grid>
                      </TableCell>
                      <TableCell align="center">
                        {mapTeam(teams[team === "Home" ? 0 : 1])}
                      </TableCell>
                      <TableCell align="center">{odds}</TableCell>
                      <TableCell align="center">
                        {convertUusdToUst(amount.amount)} UST
                      </TableCell>
                      <TableCell align="center">
                        {convertUusdToUst(match_amount.amount)} UST
                      </TableCell>
                      <TableCell align="center">
                        {matcher &&
                          connectedWallet &&
                          getWinnerAddress(winner, matcher, host) !==
                            connectedWallet.walletAddress && (
                            <Chip label="Bet taken" />
                          )}
                        {!matcher &&
                          connectedWallet &&
                          host === connectedWallet.walletAddress && (
                            <Chip label="Waiting for match" />
                          )}
                        {winner &&
                          connectedWallet &&
                          getWinnerAddress(winner, matcher, host) ===
                            connectedWallet.walletAddress && (
                            <Chip
                              label="Collect!"
                              rgbcolor={green[400]}
                              onClick={() => claimBet(connectedWallet, host)}
                            />
                          )}
                        {!matcher &&
                          connectedWallet &&
                          !(host === connectedWallet.walletAddress) && (
                            <Chip
                              label="Bet!"
                              color="primary"
                              onClick={() =>
                                takeBet(
                                  connectedWallet,
                                  host,
                                  match_amount.amount,
                                  match_amount.denom
                                )
                              }
                            />
                          )}
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </Paper>
      </Card>
    </Box>
  );
}
