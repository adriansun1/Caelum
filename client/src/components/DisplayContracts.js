import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import { getAllBets, takeBet } from "../utils/contracts";

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

export default function DisplayContracts({ title, owner }) {
  const [allBets, setAllBets] = useState([]);
  const connectedWallet = useConnectedWallet();

  useEffect(() => {
    const fetchData = async () => {
      if (connectedWallet) {
        let allBets = await getAllBets();
        allBets = allBets.filter(({ host }) => {
          const isOwnedByWallet = host === connectedWallet.walletAddress;
          return owner ? isOwnedByWallet : !isOwnedByWallet;
        });

        setAllBets(allBets);
      }
    };
    fetchData();
  }, [owner, connectedWallet]);

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
                {!owner && <TableCell>Bet Creator</TableCell>}
                <TableCell align="center">Team</TableCell>
                <TableCell align="center">Odds</TableCell>
                <TableCell align="center">Offered Amount</TableCell>
                <TableCell align="center">Match Amount</TableCell>
                <TableCell align="center">Available?</TableCell>
              </TableRow>
            </TableHead>
            {allBets.length === 0 && (
              <TableCell colSpan={6}>
                <Typography variant="h4" align="center" padding={8}>
                  No bets placed
                </Typography>
              </TableCell>
            )}
            <TableBody>
              {allBets.map(
                ({ host, team, odds, amount, match_amount, matched_bet }) => {
                  return (
                    <TableRow key={`${host}_${amount.amount}`}>
                      {!owner && <TableCell>{host}</TableCell>}
                      <TableCell align="center" component="th" scope="row">
                        <Grid container direction="column">
                          <Grid item>{team}</Grid>
                          <Grid item>{team}</Grid>
                        </Grid>
                      </TableCell>
                      <TableCell align="center">{odds}</TableCell>
                      <TableCell align="center">
                        {convertUusdToUst(amount.amount)} UST
                      </TableCell>
                      <TableCell align="center">
                        {convertUusdToUst(match_amount.amount)} UST
                      </TableCell>
                      <TableCell align="center">
                        {matched_bet && <Chip label="N/A" />}
                        {!matched_bet && owner && (
                          <Chip label="Waiting for match" />
                        )}
                        {!matched_bet && !owner && (
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
