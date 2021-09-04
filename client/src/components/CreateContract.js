import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";

import {
  Button as MuiButton,
  Card,
  Box,
  Grid,
  Typography,
  TextField,
  FormControl as MuiFormControl,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  Table,
  Paper,
  Select,
  InputLabel,
  MenuItem,
  Divider as MuiDivider,
} from "@material-ui/core";
import { spacing } from "@material-ui/system";
import { useConnectedWallet } from "@terra-money/wallet-provider";
import { contractAddress, getMatchup, proposeBet } from "../utils/contracts";
import { convertUstToUusd } from "../utils/conversions";
import { mapTeam } from "../utils/mapTeam";

const FormControlSpacing = styled(MuiFormControl)(spacing);
const FormControl = styled(FormControlSpacing)`
  min-width: 148px;
  width: 100%;
`;
const Divider = styled(MuiDivider)(spacing);
const Button = styled(MuiButton)(spacing);

function CreateContract({ title }) {
  const connectedWallet = useConnectedWallet();
  const [matchups, setMatchups] = useState([]);
  const [form, setForm] = useState({});

  function handleChange(event, field, value) {
    setForm({
      ...form,
      [event]: {
        ...form[event],
        [field]: value,
      },
    });
  }

  useEffect(() => {
    const contracts = [
      contractAddress,
      "terra18l8dhlvlehcz9lgzy3pe0qmla0aht6hpjpdsex",
      "terra1uz2l4fazzj2vvkwlw5dgn79vupl7y57tup6ydu",
    ];

    async function getContracts() {
      const allMatchups = await Promise.all(
        contracts.map((contract) => {
          return getMatchup(contract);
        })
      );
      setForm(
        allMatchups.reduce((total, curr) => ({ ...total, [curr]: "" }), {})
      );
      console.log(allMatchups);
      setMatchups(allMatchups);
    }

    getContracts();
  }, []);

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
                <TableCell align="center">Match</TableCell>
                <TableCell align="center">Winner</TableCell>
                <TableCell align="center">Odds</TableCell>
                <TableCell align="center">Risk</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchups.map(({ hometeam, awayteam }) => {
                const home = mapTeam(hometeam);
                const away = mapTeam(awayteam);
                return (
                  <TableRow key={home}>
                    <TableCell align="center" component="th" scope="row">
                      <Grid container direction="column">
                        <Grid item>{home}</Grid>
                        <Divider />
                        <Grid item>{away}</Grid>
                      </Grid>
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <InputLabel id="winner-label">Winning team</InputLabel>
                        <Select
                          labelId="winner-label"
                          id="winner"
                          value={form[home]?.winner || ""}
                          onChange={(event) =>
                            handleChange(home, "winner", event.target.value)
                          }
                          label="winner"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value={"home"}>{home}</MenuItem>
                          <MenuItem value={"away"}>{away}</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <InputLabel id="odds-amount-label">Odds</InputLabel>
                        <Select
                          labelId="odds-amount-label"
                          id="odds-amount"
                          value={form[home]?.odds || ""}
                          onChange={(event) =>
                            handleChange(home, "odds", event.target.value)
                          }
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
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        fullWidth
                        label="Bet UST"
                        id="bet-amount"
                        value={form[home]?.bet || ""}
                        onChange={(event) =>
                          handleChange(home, "bet", event.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        mt={1}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const { winner, odds, bet } = form[home];
                          proposeBet(
                            connectedWallet,
                            winner,
                            odds,
                            convertUstToUusd(bet),
                            "uusd"
                          );
                        }}
                      >
                        Create
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Card>
    </Box>
  );
}

export default CreateContract;
