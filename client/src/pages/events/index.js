import React from "react";
import styled from "styled-components/macro";

import { Helmet } from "react-helmet-async";

import {
  Box,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Divider as MuiDivider,
  Grid,
  Typography as MuiTypography,
} from "@material-ui/core";
import DisplayContracts from "../../components/DisplayContracts";
import Stats from "./Stats";
import PopularSports from "./PopularSports";
import FeaturedCarousel from "./Featured";
import SuggestedEvents from "./SuggestedEvents";

import { green } from "@material-ui/core/colors";
import { spacing } from "@material-ui/system";

const Divider = styled(MuiDivider)(spacing);

const Typography = styled(MuiTypography)(spacing);

const Card = styled(MuiCard)(spacing);

const TallCard = styled(Card)`
  height: 100%;
`;

function Title() {
  const ust = 12398;
  const weeklyBets = 2532490;

  return (
    <React.Fragment>
      <Helmet title="Events" />

      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom display="inline">
            Featured
          </Typography>
          <Divider my={2} />
          <FeaturedCarousel />
        </Grid>

        <Grid item container xs={12}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom display="inline">
              Popular Sports
            </Typography>
            <Divider my={2} />
          </Grid>
          <Grid item container xs={12} wrap="nowrap" spacing={2}>
            <PopularSports />
          </Grid>
        </Grid>

        <Grid item container xs={12} sm={6} direction="column">
          <Grid item>
            <Box mb={4}>
              <Stats
                title="Weekly Bets Placed"
                amount={weeklyBets.toLocaleString()}
                percentageText="+26%"
                percentagecolor={green[500]}
              />
            </Box>
          </Grid>
          <Grid item>
            <Stats
              title="Total Claimable Rewards"
              amount={`${ust.toLocaleString()} UST`}
              buttonText="Claim Rewards"
              onClick={() => console.log("reward claimed")}
            />
          </Grid>
        </Grid>
        <Grid item container xs={12} sm={6}>
          <Grid item xs={12}>
            <TallCard>
              <MuiCardContent>
                <Typography variant="h4">Wallet stats</Typography>
                <Typography>amount available ust?</Typography>
                <Typography>total money locked in caelum</Typography>
                <Typography>Next closest bet result countdown 2:00</Typography>
                <Typography>
                  I'm baby hammock prism tousled, selfies fashion axe yr
                  scenester ennui shaman poutine copper mug mustache pickled.
                  Ethical banh mi waistcoat man braid, poutine squid coloring
                  book la croix sriracha helvetica chillwave raclette distillery
                  truffaut. Marfa prism williamsburg iPhone typewriter
                </Typography>
              </MuiCardContent>
            </TallCard>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <DisplayContracts title="Your Contracts" owner />
        </Grid>
        <Grid item xs={12}>
          <SuggestedEvents />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Title;
