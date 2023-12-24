import React from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { Box, Button, Typography, DialogActions, DialogContent, withStyles } from '@material-ui/core';
import { CheckCircleOutline as CheckCircleOutlineIcon } from '@material-ui/icons';

import styles from '../styles';
import Header from '../../../components/Header';
import menuItems from '../../../constants/menuItems';
import withMediaQuery from '../../../constants/mediaQuery';

function DialogStepLast({ classes, store, mediaQuery, history, closeDialog }) {
  const nextStep = () => {
    store.deliveryStore.processNextStep();
    history.push(`/${store.deliveryStore.trackingCode}/edit`);
  };

  return (
    <Box>
      {mediaQuery.isMobile && <Header menuItems={menuItems} />}
      <DialogContent>
        <Typography className={classes.lastDialogText}>
          <CheckCircleOutlineIcon className={clsx(classes.inlineIcon, classes.greenIcon)} style={{ fontSize: 40 }} />
          <span className={classes.darkGrayText} style={{ fontSize: 20 }}>
            You're all set! Please proceed to Manage Delivery
          </span>
        </Typography>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <Button onClick={() => closeDialog()} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)}>
          Cancel
        </Button>
        <Button onClick={nextStep} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
          OK
        </Button>
      </DialogActions>
    </Box>
  );
}

const DialogStepLastCompose = compose(inject('store'), observer)(DialogStepLast);

export default withStyles(styles)(withRouter(withMediaQuery()(DialogStepLastCompose)));
