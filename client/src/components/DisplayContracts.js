import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import { getAllBets, getMatchup, takeBet } from "../utils/contracts";

import {
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

import { convertUusdToUst } from "../utils/conversions";
import { spacing } from "@material-ui/system";
import { useConnectedWallet } from "@terra-money/wallet-provider";

const Chip = styled(MuiChip)(spacing);
const Card = styled(MuiCard)(spacing);
const SpacedTypography = styled(MuiTypography)(spacing);
const Typography = styled(SpacedTypography)`
  width: 100%;
`;
const Divider = styled(MuiDivider)(spacing);

export default function DisplayContracts({ title, contract }) {
  const [allBets, setAllBets] = useState([]);
  const [teams, setTeams] = useState([]);
  const connectedWallet = useConnectedWallet();

  useEffect(() => {
    const fetchData = async () => {
      const { hometeam, awayteam } = await getMatchup(contract);
      setTeams([hometeam, awayteam]);

      let allBets = await getAllBets();
      setAllBets(allBets);
    };
    fetchData();
  }, [contract]);

  return (
    <Box my={4}>
      <Typography variant="h4" gutterBottom display="inline">
        {title}
      </Typography>

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
                  <TableCell colSpan={6}>
                    <Typography variant="h4" align="center" padding={8}>
                      No bets placed
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {allBets.map(
                ({ host, team, odds, amount, match_amount, matcher }) => {
                  return (
                    <TableRow key={`${host}_${amount.amount}`}>
                      <TableCell>{host}</TableCell>
                      <TableCell align="center" component="th" scope="row">
                        <Grid container direction="column">
                          <Grid item>{teams[0]}</Grid>
                          <Divider />
                          <Grid item>{teams[1]}</Grid>
                        </Grid>
                      </TableCell>
                      <TableCell align="center">
                        {teams[team === "Home" ? 0 : 1]}
                      </TableCell>
                      <TableCell align="center">{odds}</TableCell>
                      <TableCell align="center">
                        {convertUusdToUst(amount.amount)} UST
                      </TableCell>
                      <TableCell align="center">
                        {convertUusdToUst(match_amount.amount)} UST
                      </TableCell>
                      <TableCell align="center">
                        {matcher && connectedWallet && (
                          <Chip label="Bet taken" />
                        )}
                        {!matcher &&
                          connectedWallet &&
                          host === connectedWallet.walletAddress && (
                            <Chip label="Waiting for match" />
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
