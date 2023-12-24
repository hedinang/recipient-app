import React from 'react';
import clsx from 'clsx';
import { Grid, Box, Avatar, Button, Typography } from '@material-ui/core';
import _ from 'lodash';

import { getCookie, setCookie } from 'utils/cookie';
import { DAY_IN_MILLISECONDS } from 'constants/common';

function ShipmentInfo(props) {
  const {
    store,
    name,
    logo,
    classes,
    mediaQuery,
    shipment,
    isDelivered,
    trackingCode,
    canTip,
    preferredWindow,
    originalFromTime,
    originalToTime,
    deliveryTimeAndLabel,
    useDriverFeedBack,
    hideCompanyBranding
  } = props;


  const setToken = (valToken, time, step) => {
    setCookie("axl_shipment_token", valToken, time);
    store.podStore.updateField('currentStep', step);
    store.deliveryStore.openDialog(4);
  }

  const handleGiveUsFeedback = () => {
    try {
      store.deliveryStore.getFeedback();
      store.podStore.updateField('isPODFeedback', false);
      const token = getCookie('axl_shipment_token');
      if(!token) {
        setToken('', 0, 1);
        store.podStore.setImagesPOD([]);
        return;
      }
      store.deliveryStore.getTokenInfo(token, (res) => {
        if (res.ok) {
          const ttl = _.get(res, 'data.ttl', 0);
          setToken(token, ttl / DAY_IN_MILLISECONDS, 4);
          try {
            store.deliveryStore.getPOD((res) => {
              store.podStore.setImagesPOD(res.data);
            })
          } catch (error) {
            console.error(error);
          }
        } else {
          setToken('', 0, 1);
          store.podStore.setImagesPOD([]);
        }
      })
    } catch (error) {
      store.podStore.setImagesPOD([]);
      console.error(error);
    }
  }

  return (
    <Grid container className={classes.shipmentInfoContainer}>
      <Grid item xs={12} sm={6} className={classes.shipmentInfoLeft}>
        <Grid container wrap="nowrap" spacing={2} style={{ marginBottom: 15 }}>
          {!hideCompanyBranding && (
          <Grid item>
            <Avatar alt="Client Logo" src={logo} variant="square" className={classes.clientLogo} />
          </Grid>)}
          <Grid item>
            {!hideCompanyBranding && (
            <Typography className={classes.clientName} variant="h4">
              {name}
            </Typography>
             )}
            <Box style={{ fontSize: mediaQuery.isMobile ? 14 : 'inherit' }}>
              <span className={classes.grayText}>Tracking code: </span>
              <span className={classes.boldText}>{trackingCode}</span>
            </Box>
          </Grid>
        </Grid>
        <Box>
          {isDelivered && !useDriverFeedBack && (
            <Button onClick={handleGiveUsFeedback} className={clsx(classes.button, classes.hideSmall)} variant="contained" color="primary">
              Give us feedback!
            </Button>
          )}
          {isDelivered && useDriverFeedBack && (
                      <Button onClick={() => store.deliveryStore.openDialog(4)} className={clsx(classes.button, classes.hideSmall)} variant="contained" color="primary">
                        Give us driver feedback!
                      </Button>
                    )}
          {isDelivered && canTip && (
            <Button color="primary" variant="outlined" className={clsx(classes.button, classes.hideSmall, classes.tipButton)} onClick={() => store.deliveryStore.openDialog(5)}>
              Leave a Tip <span role="img" aria-label="">😃</span>
            </Button>
          )}
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} className={classes.shipmentInfoRight}>
        <Box pl={mediaQuery.isMobile ? 8.25 : 0}>
          {preferredWindow ? (
            <Box style={{ marginBottom: 15 }}>
              <div className={classes.grayTextWithMarginBtm}>Preferred Delivery on:</div>
              <div className={classes.boldText}>{preferredWindow}</div>
              <Box mt={1}>
                <small>{`* Original Delivery Window: ${originalFromTime} - ${originalToTime}`}</small>
              </Box>
            </Box>
          ) : (
            <Box style={{ marginBottom: 15 }}>
              <div className={classes.grayTextWithMarginBtm}>{deliveryTimeAndLabel.label}</div>
              <div className={classes.boldText}>{deliveryTimeAndLabel.time}</div>
            </Box>
          )}
          <Box>
            <div className={classes.grayTextWithMarginBtm}>Deliver to:</div>
            <div className={classes.boldText}>{`${shipment.dropoff_address.city}, ${shipment.dropoff_address.state.toUpperCase()}, ${shipment.dropoff_address.zipcode}`}</div>
          </Box>
        </Box>
      </Grid>
      <Box style={{ width: '100%' }}>
        {isDelivered && !useDriverFeedBack && (
          <Button onClick={handleGiveUsFeedback} className={clsx(classes.button, classes.showSmall)} fullWidth variant="contained" color="primary">
            Give us feedback!
          </Button>
        )}
        {isDelivered && useDriverFeedBack && (
                  <Button onClick={() => store.deliveryStore.openDialog(4)} className={clsx(classes.button, classes.showSmall)} fullWidth variant="contained" color="primary">
                    Give us driver feedback!
                  </Button>
                )}
        {isDelivered && canTip && (
          <Button color="primary" variant="outlined" fullWidth className={clsx(classes.button, classes.showSmall, classes.tipButton)} onClick={() => store.deliveryStore.openDialog(5)}>
            Leave a Tip <span role="img" aria-label="">😃</span>
          </Button>
        )}
      </Box>
    </Grid>
  );
}

export default ShipmentInfo;
