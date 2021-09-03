import React from "react";
import styled from "styled-components/macro";
import Carousel from "react-material-ui-carousel";

import { Helmet } from "react-helmet-async";
import Comparison from "./Comparison";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import { Box, Grid } from "@material-ui/core";
import DisplayContracts from "../../components/DisplayContracts";
import CreateContract from "../../components/CreateContract";
import SuggestedEvents from "../events/SuggestedEvents";
import { contractAddress } from "../../utils/contracts";

const StyledImage = styled.img`
  position: absolute;
  border-radius: 4px;
  height: 280px;
  object-fit: cover;
  object-position: 50% 20%;
  width: 100%;
`;

const data = {
  description: "Heavyweight Interim Title Bout",
  video: "https://www.youtube.com/embed/VbYU54MYfF0",
  team1: {
    image: "/static/img/tourney/lewis1.png",
    firstName: "Derrick",
    lastName: "Lewis",
  },
  team2: {
    image: "/static/img/tourney/gane1.png",
    firstName: "Cyril",
    lastName: "Gane",
  },
  stats: {
    title: [
      "Win/Loss/Draw",
      "Fight Win Streak",
      "Wins By Knockout",
      "Wins By Submission",
      "Striking Accuracy",
      "Grappling Accuracy",
    ],
    team1: ["25-8-0", 4, 20, 1, "50%", "27%"],
    team2: ["9-0-0", 9, 3, 3, "55%", "22%"],
  },
};

const data2 = {
  description: "Bantamweight Bout",
  video: "https://www.youtube.com/embed/zvSYxU3DASA",
  team1: {
    image: "/static/img/tourney/aldo.png",
    firstName: "Jose",
    lastName: "Aldo",
  },
  team2: {
    image: "/static/img/tourney/munhoz.png",
    firstName: "Pedro",
    lastName: "Munhoz",
  },
  stats: {
    title: [
      "Win/Loss/Draw",
      "Fight Win Streak",
      "Wins By Knockout",
      "Wins By Submission",
      "Striking Accuracy",
      "Grappling Accuracy",
    ],
    team1: ["30-7-0", 2, 17, 1, "45%", "57%"],
    team2: ["19-6-0", 1, 5, 8, "44%", "21%"],
  },
};

function Event() {
  const isXSScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));

  return (
    <Box position="relative">
      <Helmet title="Events" />

      <StyledImage src="/static/img/tourney/ufcstadium.jpg" alt="something" />

      <Carousel
        timeout={0}
        autoPlay={false}
        navButtonsAlwaysVisible={!isXSScreen}
        indicators={false}
        navButtonsWrapperProps={{
          // Move the buttons to the bottom. Unsetting top here to override default style.
          style: {
            bottom: "220px",
            top: "unset",
          },
        }}
      >
        <Comparison data={data} />
        <Comparison data={data2} />
      </Carousel>

      <Box paddingX="20px">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <DisplayContracts title="Contracts" contract={contractAddress} />
          </Grid>
          <Grid item xs={12}>
            <CreateContract title="Create Contract" />
          </Grid>
        </Grid>

        <Box mt={4}>
          <SuggestedEvents />
        </Box>
      </Box>
    </Box>
  );
}

export default Event;
