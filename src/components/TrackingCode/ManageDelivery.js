import React from 'react';
import clsx from 'clsx';
import { Box, Grid, Button } from '@material-ui/core';
import { FiberManualRecord } from '@material-ui/icons';

function ManageDelivery(props) {
  const { classes, store, mediaQuery } = props;

  return (
    <Box className={classes.manageDeliveryContainer} my={mediaQuery.isMobile ? 2 : 3}>
      <Grid container alignItems="stretch" justify="center">
        <Grid item xs={12} sm={6} className={clsx(classes.manageDeliveryInner, classes.manageDeliveryLeft)}>
          <Box p={2}>
            <Box className={classes.mdTitle}>“Delivery flexibility to fit your schedule” </Box>
            <Box my={1}>Update these with our Manage Delivery feature</Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} className={classes.manageDeliveryInner}>
          <Box p={2}>
            <Grid align="left" container spacing={1}>
              <Grid item xs={6}>
                <FiberManualRecord fontSize="inherit" className={classes.mdItem} /> Delivery instructions
              </Grid>
              <Grid item xs={6}>
                <FiberManualRecord fontSize="inherit" className={classes.mdItem} /> Delivery address
              </Grid>
              <Grid item xs={6}>
                <FiberManualRecord fontSize="inherit" className={classes.mdItem} /> Location pin
              </Grid>
              <Grid item xs={6}>
                <FiberManualRecord fontSize="inherit" className={classes.mdItem} /> Access code
              </Grid>
            </Grid>
            <Box my={1}>
              <Button onClick={() => store.deliveryStore.openDialog(1)} className={classes.button} fullWidth variant="contained" color="primary">
                Manage Delivery
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ManageDelivery;
