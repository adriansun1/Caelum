import React, { useEffect } from "react";
import Stats from "./Stats";

function ClaimRewards() {
  const ust = 12398;

  useEffect(() => {
    // get available UST rewards
  });

  return (
    <React.Fragment>
      <Stats
        title="Total Claimable Rewards"
        amount={`${ust.toLocaleString()} UST`}
        buttonText="Claim All Rewards"
        onClick={() =>
          alert("Cant do this yet, claim individuals from the contracts table")
        }
      />
    </React.Fragment>
  );
}

export default ClaimRewards;
