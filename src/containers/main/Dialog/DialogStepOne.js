import React from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';

import { Box, Button, Typography, DialogActions, DialogContent, DialogTitle, FormControlLabel, RadioGroup, withStyles } from '@material-ui/core';
import { Drafts as DraftsIcon, PhoneIphone as PhoneIphoneIcon } from '@material-ui/icons';

import styles from '../styles';
import Header from '../../../components/Header';
import menuItems from '../../../constants/menuItems';
import RadioButton from '../../../components/RadioButton';
import withMediaQuery from '../../../constants/mediaQuery';

function DialogStepOne({ store, mediaQuery, classes, closeDialog }) {
  const handleChangeVerificationMethod = (e) => {
    if (!e.target || !e.target.value) return;

    store.deliveryStore.setVerificationMethod(e.target.value);
  };

  const nextStep = () => {
    store.deliveryStore.processNextStep();
  };

  const { delivery, verificationMethod } = store.deliveryStore;

  if (!delivery) return null;

  const { shipment } = delivery;

  return (
    <Box>
      {mediaQuery.isMobile && <Header menuItems={menuItems} />}
      <DialogTitle>
        <strong>Please help us to verify it's you</strong>
      </DialogTitle>
      <DialogContent>
        <Typography className={classes.darkGrayText}>We will send a verification code to your preferred means of contact to make sure it's you!</Typography>
        {!shipment.customer || (!shipment.customer.phone_number && !shipment.customer.email) ? (
          <Box py={2}>
            <Typography color="primary">Look like you have not provided phone number or email address with this delivery. Please contact support for addition help!</Typography>
          </Box>
        ) : (
          <Box>
            <Box py={1} mt={3} mb={2} className={classes.dialogMethodSelectTitle}>
              <strong>Select a verification method</strong>
            </Box>
            <RadioGroup onChange={handleChangeVerificationMethod} defaultValue={verificationMethod} name="verify_type">
              {shipment.customer.phone_number && (
                <FormControlLabel
                  value="sms"
                  control={<RadioButton />}
                  className={classes.radioLabelWrapper}
                  label={
                    <span className={clsx(classes.darkGrayText, classes.radioLabel)}>
                      {`Receive a verification code in a SMS message via your phone ${shipment.customer.phone_number}`}
                      <PhoneIphoneIcon className={classes.inlineIcon} />
                    </span>
                  }
                />
              )}
              {shipment.customer.email && (
                <FormControlLabel
                  value="email"
                  control={<RadioButton />}
                  className={classes.radioLabelWrapper}
                  label={
                    <span className={clsx(classes.darkGrayText, classes.radioLabel)}>
                      {`Receive a verification code via your email address ${shipment.customer.email}`}
                      <DraftsIcon className={classes.inlineIcon} />
                    </span>
                  }
                />
              )}
            </RadioGroup>
          </Box>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActionsWrapper}>
        <Button onClick={() => closeDialog()} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)}>
          Cancel
        </Button>
        <Button onClick={nextStep} disabled={!verificationMethod} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
          Next
        </Button>
      </DialogActions>
    </Box>
  );
}

const DialogStepOneCompose = compose(inject('store'), observer)(DialogStepOne);

export default withStyles(styles)(withMediaQuery()(DialogStepOneCompose));
