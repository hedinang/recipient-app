import React from 'react';
import {Box, Container, Typography, Button, Grid, withStyles} from '@material-ui/core';
import styles from './styles';

function ErrorPageContainer({classes, ...props}) {
  return <Container>
    <Box height={'calc(100vh - 75px)'} display={'flex'}>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}>
        <Grid item>
          <img className={classes.logo} src={`/assets/images/svg/box.svg`} width={175} />
        </Grid>
        <Grid>
          <Box>
            <Typography className={classes.title}>{`Sorry, tracking ID not found!`}</Typography>
            <Box width={200} my={0.5} px={0.5} mx={'auto'}>
              <Button onClick={() => window.location.href = '/'} className={classes.button}>{`BACK TO SITE`}</Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </Container>
}

export default withStyles(styles)(ErrorPageContainer)