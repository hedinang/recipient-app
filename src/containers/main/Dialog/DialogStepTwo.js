import React, { useState } from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import ReactCodeInput from 'react-verification-code-input';

import { withStyles, Box, Button, Typography, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel } from '@material-ui/core';
import { Drafts as DraftsIcon, PhoneIphone as PhoneIphoneIcon, CheckCircleOutline as CheckCircleOutlineIcon, HighlightOff as HighlightOffIcon } from '@material-ui/icons';

import styles from '../styles';
import Header from '../../../components/Header';
import menuItems from '../../../constants/menuItems';
import withMediaQuery from '../../../constants/mediaQuery';

function DialogStepTwo({ classes, store, mediaQuery, closeDialog }) {
  const [data, setData] = useState({ disableNext: true, policyAccepted: false, code: [] });

  const nextStep = () => {
    store.deliveryStore.processNextStep();
  };

  const handleCodeInput = (value) => {
    store.deliveryStore.inputtingCode(value);
    setData({ ...data, disableNext: true });
  };

  const resendCode = (e) => {
    e.preventDefault();
    store.deliveryStore.requestCode();
  };

  const changeVerificationMethod = (e) => {
    e.preventDefault();
    const { deliveryStore } = store;
    const { verificationMethod } = deliveryStore;

    const newMethod = verificationMethod === 'sms' ? 'email' : 'sms';
    deliveryStore.setVerificationMethod(newMethod);
    deliveryStore.requestCode();
  };

  const { disableNext, policyAccepted } = data;
  const { delivery, verificationMethod, verifyingCode, codeVerified, dialogLoading } = store.deliveryStore;

  if (!delivery) return null;

  const { shipment } = delivery;

  return (
    <Box>
      {mediaQuery.isMobile && <Header menuItems={menuItems} />}
      <DialogTitle>
        <strong>Please help us to verify it's you</strong>
      </DialogTitle>
      <DialogContent>
        <Typography className={classes.darkGrayText}>
          We sent a verification code
          {verificationMethod === 'sms' ? (
            <span>
              {' '}
              in a SMS message via your phone {shipment.customer.phone_number} <PhoneIphoneIcon className={classes.inlineIcon} />
            </span>
          ) : (
            <span>
              {' '}
              via your email address {shipment.customer.email} <DraftsIcon className={classes.inlineIcon} />
            </span>
          )}
        </Typography>
        <Box py={1} mt={3} mb={2}>
          <strong>Enter verification code</strong>
        </Box>
        <Box>
          <Box>
            {!dialogLoading ? (
              <ReactCodeInput
                type="number"
                loading={verifyingCode}
                autoFocus
                fields={6}
                fieldWidth={mediaQuery.isMobile ? 30 : undefined}
                fieldHeight={mediaQuery.isMobile ? 30 : undefined}
                className={clsx({
                  [classes.codeInput]: true,
                  [classes.codeOk]: !!codeVerified,
                  [classes.codeWrong]: codeVerified === false,
                })}
                onChange={handleCodeInput}
                onComplete={() => store.deliveryStore.verifyCode((isVerified) => setData({ ...data, disableNext: !isVerified }))}
              />
            ) : (
              <Box style={{ height: 60, padding: 2 }} /> // placeholder
            )}
            {!!codeVerified && <CheckCircleOutlineIcon className={clsx(classes.greenIcon, classes.codeStatusIcon)} />}
            {codeVerified === false && <HighlightOffIcon className={clsx(classes.redIcon, classes.codeStatusIcon)} />}
          </Box>
          <ul style={{ paddingLeft: mediaQuery.isMobile && '16px' }}>
            <li className={clsx(classes.darkGrayText, classes.hint)}>
              Don't receive your code? Click <a href="#code" onClick={(e) => resendCode(e)}>here</a> to send again!
            </li>
            {shipment.customer.phone_number && shipment.customer.email && (
              <li className={clsx(classes.darkGrayText, classes.hint)}>
                Change verification method? Click <a href="#method" onClick={(e) => changeVerificationMethod(e)}>here</a>to send verification code
                {verificationMethod === 'sms' ? (
                  <span>
                    {' '}
                    via your email address {shipment.customer.email} <DraftsIcon className={classes.inlineIcon} />
                  </span>
                ) : (
                  <span>
                    {' '}
                    in a SMS message via your phone {shipment.customer.phone_number} <PhoneIphoneIcon className={classes.inlineIcon} />
                  </span>
                )}
              </li>
            )}
          </ul>
        </Box>
        <Box>
          <FormControlLabel
            control={<Checkbox checked={policyAccepted} onChange={(e) => setData({ ...data, policyAccepted: e.target.checked })} value="agreed_policy" color="primary" />}
            label={
              <span className={classes.darkGrayText}>
                I agree to AxleHire's <a href="https://axlehire.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </span>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActionsWrapper}>
        <Button onClick={() => closeDialog()} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)}>
          Cancel
        </Button>
        <Button onClick={nextStep} disabled={disableNext || !policyAccepted} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
          Confirm
        </Button>
      </DialogActions>
    </Box>
  );
}

const DialogStepTwoCompose = compose(inject('store'), observer)(DialogStepTwo);

export default withStyles(styles)(withMediaQuery()(DialogStepTwoCompose));
