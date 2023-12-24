import React, { useState } from "react";
import { Container, Box } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

const PODContainer = (props) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const url = props?.match?.params.data;
  
  if (window.zE) {
    window.zE('messenger', 'hide');
  }
  return (
    <Container>
      {!loaded && !error && (
        <Box width={200} height={75} mt={10} display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <CircularProgress size={50} />
        </Box>
      )}
      {error && <Box mt={10}> The image expired, please ask supporter send image again</Box>}
      <img style={loaded ? { width: "100%", height: "auto" } : { display: "none" }} src={decodeURIComponent(url)} onLoad={() => setLoaded(true)} onError={() => setError(true)} />
    </Container>
  );
};
export default PODContainer;
