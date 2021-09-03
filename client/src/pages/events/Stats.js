import React from "react";
import styled from "styled-components/macro";

import {
  Box,
  Button,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Typography as MuiTypography,
} from "@material-ui/core";

import { rgba } from "polished";

import { spacing } from "@material-ui/system";

const SpacedCard = styled(MuiCard)(spacing);
const Card = styled(SpacedCard)`
  height: 100%;
`;

const Typography = styled(MuiTypography)(spacing);

const CardContent = styled(MuiCardContent)`
  position: relative;

  &:last-child {
    padding-bottom: ${(props) => props.theme.spacing(4)}px;
  }
`;

const Percentage = styled(MuiTypography)`
  span {
    color: ${(props) => props.percentagecolor};
    font-weight: ${(props) => props.theme.typography.fontWeightBold};
    background: ${(props) => rgba(props.percentagecolor, 0.1)};
    padding: 2px;
    border-radius: 3px;
    margin-right: ${(props) => props.theme.spacing(2)}px;
  }
`;

const Stats = ({
  title,
  amount,
  percentageText,
  percentagecolor,
  buttonText,
  onClick,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          {title}
        </Typography>
        <Typography variant="h3" mb={1}>
          <Box fontWeight="fontWeightRegular">{amount}</Box>
        </Typography>
        {percentageText && percentagecolor && (
          <Percentage
            variant="subtitle2"
            mb={4}
            color="textSecondary"
            percentagecolor={percentagecolor}
          >
            <span>{percentageText}</span> Since last week
          </Percentage>
        )}
        {buttonText && onClick && (
          <Box mt={2}>
            <Button onClick={onClick} variant="contained" color="primary">
              {buttonText}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Stats;
