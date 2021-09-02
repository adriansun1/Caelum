import React, { useState } from "react";
import styled from "styled-components/macro";

import {
  Button as MuiButton,
  Card,
  CardContent,
  Box,
  Grid,
  Typography,
  TextField,
  FormControl as MuiFormControl,
  FormHelperText,
  Select,
  InputLabel,
  MenuItem,
  Divider as MuiDivider,
} from "@material-ui/core";
import { spacing } from "@material-ui/system";
import { useConnectedWallet } from "@terra-money/wallet-provider";
import { createBet } from "../utils/contracts";
import { convertUstToUusd } from "../utils/conversions";

const FormControlSpacing = styled(MuiFormControl)(spacing);
const FormControl = styled(FormControlSpacing)`
  min-width: 148px;
  width: 100%;
`;
const Divider = styled(MuiDivider)(spacing);
const Button = styled(MuiButton)(spacing);

function CreateContract({ title }) {
  const connectedWallet = useConnectedWallet();
  const [event, setEvent] = useState("UFC 265");
  const [winner, setWinner] = useState("");
  const [odds, setOdds] = useState("");
  const [bet, setBet] = useState("");

  return (
    <Box my={4}>
      <Typography variant="h4" gutterBottom display="inline">
        {title}
      </Typography>

      <Divider my={2} />

      <Card>
        <CardContent>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <FormControl variant="outlined">
                <InputLabel id="event-label">Event</InputLabel>
                <Select
                  labelId="event-label"
                  id="event"
                  value={event}
                  onChange={(event) => setEvent(event.target.value)}
                  label="event"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={"UFC 265"}>UFC 265</MenuItem>
                  <MenuItem value={"UFC Fight Night: Brunson vs Till"}>
                    UFC Fight Night: Brunson vs Till
                  </MenuItem>
                  <MenuItem value={"UFC 266"}>UFC 266</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined">
                <InputLabel id="winner-label">Winning team</InputLabel>
                <Select
                  labelId="winner-label"
                  id="winner"
                  value={winner}
                  onChange={(event) => setWinner(event.target.value)}
                  label="winner"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={"Derrick Lewis"}>Derrick Lewis</MenuItem>
                  <MenuItem value={"Cyril Gane"}>Cyril Gane</MenuItem>
                  <MenuItem value={"Jose Aldo"}>Jose Aldo</MenuItem>
                  <MenuItem value={"Pedro Munhoz"}>Pedro Munhoz</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={3}>
              <FormControl variant="outlined">
                <InputLabel id="odds-amount-label">Odds</InputLabel>
                <Select
                  labelId="odds-amount-label"
                  id="odds-amount"
                  value={odds}
                  onChange={(event) => setOdds(event.target.value)}
                  label="odds"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={-120}>-120</MenuItem>
                  <MenuItem value={-110}>-110</MenuItem>
                  <MenuItem value={-100}>-100</MenuItem>
                  <MenuItem value={105}>105</MenuItem>
                  <MenuItem value={115}>115</MenuItem>
                  <MenuItem value={125}>125</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                type="number"
                fullWidth
                variant="outlined"
                label="Bet UST"
                id="bet-amount"
                onChange={(event) =>
                  setBet(convertUstToUusd(event.target.value))
                }
              />
              <FormHelperText>Minimum 100 UST</FormHelperText>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="primary"
            mt={6}
            onClick={() =>
              createBet(connectedWallet, winner, odds, bet, "uusd")
            }
          >
            Create Contract
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CreateContract;
