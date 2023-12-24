import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import clsx from 'clsx';
import { Box, Button, IconButton, TextField, Grid, DialogTitle, DialogActions, DialogContent, InputAdornment, withStyles, FormControlLabel, RadioGroup, CircularProgress } from '@material-ui/core';
import { Close as CloseIcon, Drafts as DraftsIcon, Check as CheckIcon } from '@material-ui/icons';

import styles from '../styles';
import { compose } from 'recompose';
import Stripe from '../../../components/Stripe';
import withMediaQuery from '../../../constants/mediaQuery';
import RadioButton from '../../../components/RadioButton';
import Header from '../../../components/Header';
import menuItems from '../../../constants/menuItems';

const DEFAULT_TIP_AMOUNT_LIST = [3, 5, 10, 15];

function DialogTip({ store, classes, step, mediaQuery, closeDialog }) {
  const [data, setData] = useState({
    step: 1,
    showCustomTip: false,
    tipAmountList: [3, 5, 10, 15],
    emailType: 'saved_email',
    receiptEmail: '',
    sendingEmail: false,
    successSentEmail: false,
  });
  const [showTipFee, setShowTipFee] = useState(false);
  const fee = Number.parseFloat(process.env.REACT_APP_STRIPE_FEE);
  const feeAddition = Number.parseFloat(process.env.REACT_APP_STRIPE_FEE_ADDITION);

  useEffect(() => {
    const { delivery } = store.deliveryStore;

    if (!delivery) return null;

    if (delivery.settings.show_tip_fee && delivery.settings.show_tip_fee === 'true') {
      setShowTipFee(true);
    }

    const tipAmountList = delivery.settings && delivery.settings.tip_amount_list ? delivery.settings.tip_amount_list.split('|') : DEFAULT_TIP_AMOUNT_LIST;
    setData({ ...data, tipAmountList });

    store.deliveryStore.retrieveSentTip();
    store.deliveryStore.retrievePendingTip((tip) => {
      if (!!tip && !!tip.amount && !tipAmountList.includes(tip.amount)) {
        setData({ ...data, showCustomTip: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeTippingData = (field, value, custom) => {
    const { showCustomTip } = data;

    store.deliveryStore.setTipField(field, value);
    if (field === 'amount') {
      const calculatedFee = !!value && !isNaN(value) ? (value * fee + feeAddition).toFixed(2) : 0;
      store.deliveryStore.setTipField('precalculated_fee', calculatedFee);
    }
    store.deliveryStore.dialogErrorMsg = '';
    if (showCustomTip) setData({ ...data, showCustomTip: custom });
  };

  const handleCancelTipping = () => {
    const { tipping } = store.deliveryStore;

    if (tipping.tip_service_id) {
      store.deliveryStore.cancelTipping();
    } else {
      closeDialog();
    }
  };

  const handleBeforeSubmitCardDetail = () => {
    store.deliveryStore.dialogLoading = true;
  };

  const handleOnSubmitFailed = () => {
    store.deliveryStore.dialogLoading = false;
  };

  const handleOnSubmitError = () => {
    store.deliveryStore.dialogLoading = false;
    store.deliveryStore.dialogErrorMsg = 'ERROR while submitting your request. Please try again later!';
    setTimeout(() => (store.deliveryStore.dialogErrorMsg = ''), 1000);
  };

  const processNextStep = () => {
    if (data.step === 1) {
      if (store.deliveryStore.tipping.amount.toString().indexOf(',') > -1) {
        store.deliveryStore.dialogErrorMsg = 'Please use dot "." instead of comma ","';
        return false;
      }

      if (store.deliveryStore.tipping.amount < 0.5) {
        store.deliveryStore.dialogErrorMsg = 'Minimum amount is $0.5';
        return false;
      }

      store.deliveryStore.triggerTipping(() => setData({ ...data, step: data.step + 1 }));
      return;
    }

    if (data.step === 2) {
      store.deliveryStore.confirmedTipping(() => setData({ ...data, step: data.step + 1 }));
      return;
    }

    if (data.step === 3) {
      store.deliveryStore.closeTipDialog();
    }
  };

  const sendEmail = () => {
    const { receiptEmail, emailType } = data;
    const { tipping } = store.deliveryStore;
    const request = {
      email: receiptEmail,
      pay_id: tipping.tip_service_id,
      use_customer_email: emailType === 'saved_email',
    };

    setData({ ...data, sendingEmail: true });
    store.deliveryStore.sendReceiptEmail(request, (res) => {
      if (res.ok) {
        setData({ ...data, successSentEmail: true });
      }

      setData({ ...data, sendingEmail: false });
    });
  };

  const renderTipping = () => {
    const { showCustomTip, step, tipAmountList, receiptEmail, emailType, sendingEmail, successSentEmail } = data;
    const { delivery, settings, tipping, isTipped } = store.deliveryStore;
    const { shipment } = delivery;

    const tipFee = tipping.amount && !isNaN(tipping.amount) ? (tipping.amount * fee + feeAddition).toFixed(2) : 0;
    const tipAmount = tipping.amount && !isNaN(tipping.amount) ? (tipping.amount - tipFee).toFixed(2) : 0;
    const tipActualText = process.env.REACT_APP_TIP_ACTUAL_TEXT.replace('tipAmount', `$${tipAmount}`);
    const tipFeeText = process.env.REACT_APP_TIP_FEE_TEXT.replace('tipFee', `$${tipFee}`);

    if (step === 1) {
      return (
        <>
          <DialogContent>
            <Box className={classes.feedbackContainer} py={1}>
              <Box mb={2} className={classes.grayText}>
                Please select/enter the amount you would like to tip your driver.
              </Box>
              <Grid container spacing={mediaQuery.isMobile ? 1 : 3} justify="space-around">
                {tipAmountList.map((amount, index) => (
                  <Grid xs={12} sm="auto" item key={index}>
                    <Button variant={!showCustomTip && amount === tipping.amount ? 'contained' : 'outlined'} color="primary" disableElevation fullWidth={mediaQuery.isMobile} className={classes.button} style={{ paddingLeft: 30, paddingRight: 30 }} onClick={() => handleChangeTippingData('amount', amount, false)}>
                      ${parseInt(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Button>
                  </Grid>
                ))}
                <Grid xs={12} sm="auto" item>
                  <Button variant={showCustomTip || (!!tipping.amount && !tipAmountList.includes(tipping.amount)) ? 'contained' : 'outlined'} color="primary" disableElevation fullWidth={mediaQuery.isMobile} className={classes.button} style={{ minWidth: 100 }} onClick={() => setData({ ...data, showCustomTip: true })}>
                    Custom
                  </Button>
                </Grid>
              </Grid>
              {showCustomTip && (
                <Box pt={mediaQuery.isMobile ? 1 : 2} align="center">
                  <TextField
                    variant="outlined"
                    type="number"
                    placeholder="Enter Amount"
                    margin="dense"
                    style={{ width: 300, maxWidth: '100%' }}
                    fullWidth={mediaQuery.isMobile}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    value={tipping.amount}
                    onChange={(e) => handleChangeTippingData('amount', e.target.value, true)}
                  />
                </Box>
              )}
              {showTipFee && !!tipFee && (
                <Box p={2} align="center" className={classes.grayText}>
                  <Box pr={0.5} component="span" dangerouslySetInnerHTML={{ __html: tipActualText }} />
                  <Box component="span" dangerouslySetInnerHTML={{ __html: tipFeeText }} />
                </Box>
              )}
              {isTipped && (
                <Box pt={2} style={{ fontSize: 14, color: '#bababa' }}>
                  A tip has already been received for this delivery
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions className={classes.dialogActionsWrapper} style={{ justifyContent: 'flex-end' }}>
            <Grid container justify="flex-end" alignItems="center" spacing={2}>
              <Grid item>
                <Button variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)} onClick={processNextStep}>
                  Next
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </>
      );
    } else if (step === 2) {
      return (
        <>
          <DialogContent>
            <Box>
              <Box py={2}>Select the method you would like to use to pay the amount shown below and complete the payment.</Box>
              <Box py={2} style={{ textAlign: 'center' }}>
                <Box py={1} style={{ textTransform: 'uppercase', color: '#ababab', fontWeight: 600, fontSize: 14 }}>
                  Total Amount
                </Box>
                <Box py={1} style={{ fontSize: 24, fontWeight: 800 }}>
                  ${tipping.amount && tipping.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  {showTipFee && !!tipFee && (
                    <Box component="small" px={1} style={{ fontSize: 14 }}>
                      (${tipAmount} tip + ${tipFee} fee)
                    </Box>
                  )}
                </Box>
              </Box>
              <Stripe beforeSubmit={handleBeforeSubmitCardDetail} onBack={() => setData({ ...data, step: data.step - 1 })} onCancel={handleCancelTipping} onSuccess={processNextStep} onFail={handleOnSubmitFailed} onError={handleOnSubmitError} tipping={tipping} useCreditCard />
            </Box>
          </DialogContent>
        </>
      );
    } else if (step === 3) {
      return (
        <>
          {settings && settings.enable_email_receipt && settings.enable_email_receipt === 'true' && (
            <DialogContent>
              <Box className={classes.grayText}>If you would like a confirmation receipt, please select which email you would like it sent to below.</Box>
              <Box pt={2}>
                <RadioGroup name="preferred_window" value={emailType} className={classes.radioGroup}>
                  {shipment.customer && shipment.customer.email && (
                    <Grid container alignItems="center" style={{ marginBottom: 10 }}>
                      <Grid item xs={12} sm={8} className={classes.emailLabelWrapper}>
                        <FormControlLabel
                          className={classes.radioLabelWrapper}
                          control={<RadioButton />}
                          label={
                            <div className={clsx(classes.darkGrayText, classes.radioLabelWithColor)} style={{ verticalAlign: 'sub' }}>
                              <span style={{ marginRight: 5 }}>{shipment.customer.email}</span>
                              <DraftsIcon className={classes.inlineIcon} />
                            </div>
                          }
                          value="saved_email"
                          onChange={(e) => setData({ ...data, emailType: e.target.value, successSentEmail: false })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} className={classes.sendEmailWrapper}>
                        {emailType === 'saved_email' && (
                          <Button variant="outlined" color="inherit" onClick={() => sendEmail()} className={clsx(classes.button, classes.dialogButton, classes.sendEmailBtn, { [classes.sendEmailSuccess]: successSentEmail })} disabled={sendingEmail} endIcon={successSentEmail && <CheckIcon fontSize="small" color="inherit" style={{ verticalAlign: 'sub' }} />}>
                            {sendingEmail ? <CircularProgress color="inherit" size={20} style={{ verticalAlign: 'sub' }} /> : 'Send'}
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  )}
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={8} className={classes.emailLabelWrapper}>
                      <FormControlLabel
                        className={classes.radioLabelWrapper}
                        control={<RadioButton />}
                        label={
                          <div style={{ lineHeight: '30px' }} className={clsx(classes.darkGrayText, classes.radioLabelWithColor)}>
                            <Grid container alignItems="center">
                              <Grid item>
                                <span>Other{emailType === 'custom_email' ? ':' : ''}</span>
                              </Grid>
                              <Grid item style={{ flex: 1 }}>
                                {emailType === 'custom_email' && <TextField fullWidth margin="dense" placeholder="Enter email" value={receiptEmail} style={{ paddingLeft: 5, margin: 0 }} onChange={(e) => setData({ ...data, receiptEmail: e.target.value })} />}
                              </Grid>
                            </Grid>
                          </div>
                        }
                        value="custom_email"
                        onChange={(e) => setData({ ...data, emailType: e.target.value, successSentEmail: false })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4} className={classes.sendEmailWrapper}>
                      {emailType === 'custom_email' && (
                        <Button variant="outlined" color="primary" disabled={!receiptEmail || sendingEmail} onClick={() => sendEmail()} className={clsx(classes.button, classes.dialogButton, classes.sendEmailBtn)} endIcon={successSentEmail && <CheckIcon fontSize="small" color="inherit" style={{ verticalAlign: 'sub' }} />}>
                          {sendingEmail ? <CircularProgress color="inherit" size={20} style={{ verticalAlign: 'sub' }} /> : 'Send'}
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </RadioGroup>
              </Box>
            </DialogContent>
          )}
          <DialogActions className={classes.dialogActionsWrapper} style={{ justifyContent: 'flex-end' }}>
            <Grid container justify="flex-end" alignItems="center" spacing={2}>
              <Grid item>
                <Button variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)} onClick={processNextStep}>
                  Done
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </>
      );
    }
  };

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;

  if (!delivery) return null;

  let title = 'Show your appreciation for your delivery driver 😃';
  if (data.step === 2) {
    title = 'Enter your card information';
  } else if (data.step === 3) {
    title = 'Thank you for showing your appreciation for your delivery driver! 😃';
  }

  return (
    <Box>
      {mediaQuery.isMobile && <Header menuItems={menuItems} />}
      <DialogTitle className={classes.tippingTitleContainer}>
        <Box pt={2} pb={1} className={classes.tippingTitle}>
          <strong className={classes.tippingHeader}>{title}</strong>
          {data.step !== 3 && (
            <IconButton onClick={handleCancelTipping} aria-label="Cancel Tipping" className={classes.dialogCloseButton}>
              <CloseIcon color="inherit" fontSize="large" />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      {renderTipping()}
    </Box>
  );
}

const DialogTipCompose = compose(inject('store'), observer)(DialogTip);

export default withStyles(styles)(withMediaQuery()(DialogTipCompose));
