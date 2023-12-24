import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import clsx from 'clsx';
import 'moment-timezone';
import moment from 'moment';
import { compose } from 'recompose';
import {
  Box, Button, IconButton, Grid, DialogActions, DialogContent, DialogTitle, TextField, withStyles, Typography, CircularProgress,
} from '@material-ui/core';
import {
  ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon, Close as CloseIcon,
  ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon
} from '@material-ui/icons';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import DeckGL, { IconLayer } from 'deck.gl';
import _ from 'lodash';

import styles from '../styles';
import ThumbUpFeedBack from './DialogThumbUp';
import withMediaQuery from '../../../constants/mediaQuery';
import PACKAGE_MARKERS from '../../../assets/svg/package_marker.svg';
import Header from '../../../components/Header';
import menuItems from '../../../constants/menuItems';
import PreselectThumbUp from 'components/PreselectThumbUp';
import PreselectThumbDown from 'components/PreselectThumbDown';
import VerificationToken from 'components/VerificationToken';
import SelectPreferredPhoto from 'components/SelectPreferredPhoto';
import api from 'utils/api';


const mapStyle = `https://api.maptiler.com/maps/topo/style.json?key=${process.env.REACT_APP_MAP_TILER_KEY}`;

function DialogFeedback({ store, classes, mediaQuery, closeDialog, isDisplayPackage = true, isDisplayMenu = true }) {
  const [finishUpFeedback, setFinishUpFeedback] = useState(false);
  const [showPackageLocation, setShowPackageLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 37.772402,
    longitude: -122.414265,
    zoom: 15,
    maxZoom: 19,
    minZoom: 12,
  });
  const [images, setImages] = useState(store?.podStore?.imagesPOD);
  const [isShowSelectPhoto, setIsShowSelectPhoto] = useState(false);

  useEffect(() => {
    store.deliveryStore.getPackageLocation(res => {
      if (res.ok) {
        setViewport({...viewport, ...res.data});
      }
    });
  }, [store.deliveryStore]);

  const nextStep = () => {
    store.deliveryStore.setDialogErrorMsg("");
    setIsLoading(true);
    store.deliveryStore.processNextStep(res => {
      setIsLoading(false);
      if(res.ok) {
        setIsShowSelectPhoto(true);
        store.podStore.updateField('isChanged', false);
        store.deliveryStore.updateField('isSubmittedFeedback', true);
      }
    });
  };

  const handleSubmit = () => {
    nextStep();
  };

  const handleChangeFeedbackData = (field, value) => {
    store.deliveryStore.setDialogErrorMsg("");
    const { feedback } = store.deliveryStore;

    if (field === 'thumb') {
      if (value === feedback.thumb) value = undefined;
      store.deliveryStore.setFeedbackField('tags', []);
    }

    if (field === 'tags') value = [value];

    store.deliveryStore.setFeedbackField(field, value);
  };

  const openManageDelivery = (e) => {
    e.preventDefault();
    window.open(`/${store.deliveryStore.trackingCode}?manage=true`, '_blank');
  }

  const renderMarker = (location) => {
    if (!location) return null;

    return new IconLayer({
      id: 'package-marker',
      data: [
        {
          location: [location.longitude, location.latitude],
          size: 40,
          icon: 'green',
        },
      ],
      pickable: true,
      iconAtlas: PACKAGE_MARKERS,
      iconMapping: {
        green: { x: 0, y: 0, width: 64, height: 83, anchorY: 83 },
      },
      getIcon: (d) => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      billboard: false,
      getPosition: (d) => d.location,
      getSize: (d) => d.size,
    });
  };

  const { deliveryStore } = store;
  const { delivery, feedback, packageLocation } = deliveryStore;
  if (!delivery) return null;

  const { shipment } = delivery;
  const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
  let latestUpdated = null;
  let canSubmit = true;

  if (!!feedback._updated) {
    latestUpdated = moment(feedback._updated).tz(timezone).format('h:mm A, DD/MM/YYYY');
    canSubmit = moment().format('x') - moment(feedback._updated).format('x') > 30 * 1000; // 30s
  }

  const hasPackageLocation = packageLocation && packageLocation.latitude && packageLocation.longitude;
  const layers = [renderMarker(packageLocation)];

  const handleClose = () => {
    if (store.deliveryStore.isSubmittedFeedback) {
      setFinishUpFeedback(true);
      return;
    }
    api.get(`/delivery/${deliveryStore.trackingCode}/${deliveryStore.delivery.shipment.id}/feedback/${deliveryStore.getLatestDropoffSuccess().stop_id}`)
    .then(res => deliveryStore.updateField('feedback', res.data || {}))
    closeDialog();
  }

  return (
    <Box>
      {mediaQuery.isMobile && isDisplayMenu && <Header menuItems={menuItems} />}
      {store?.podStore?.currentStep < 4 && <VerificationToken store={store} closeDialog={closeDialog} setImages={val => setImages(val)}/> }
      {store?.podStore?.currentStep === 4 && (
        <>
          <DialogTitle className={classes.feedbackTitleContainer}>
            <Box py={2} className={finishUpFeedback ? classes.feedbackTitleNoBottom : classes.feedbackTitle}>
              {!finishUpFeedback && <strong>Give us Feedback!</strong>}
              <IconButton onClick={handleClose} aria-label="Cancel Feedback" className={classes.dialogCloseButton}>
                <CloseIcon color="inherit" fontSize="large" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent className={classes.rootDialogContent}>
            {finishUpFeedback && <ThumbUpFeedBack thumbValue={feedback.thumb} />}
            {!finishUpFeedback && !isShowSelectPhoto && (
              <Box py={1} className={classes.feedbackContainer}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4} className={clsx(classes.selfCenter, {[classes.justifyContentCenter]: mediaQuery.isMobile})}>
                    <strong>Was it a good delivery experience?</strong>
                  </Grid>
                  <Grid item xs={12} sm={6} md={8} className={clsx(classes.selfCenter, {[classes.justifyContentCenter]: mediaQuery.isMobile})}>
                    <IconButton onClick={() => handleChangeFeedbackData('thumb', true)}>
                      <ThumbUpIcon className={clsx({ [classes.greenIcon]: !!feedback.thumb })} />
                    </IconButton>
                    <IconButton onClick={() => handleChangeFeedbackData('thumb', false)}>
                      <ThumbDownIcon className={clsx({ [classes.redIcon]: feedback.thumb === false })} />
                    </IconButton>
                  </Grid>
                  {feedback.thumb === true && <PreselectThumbUp handleChange={e => handleChangeFeedbackData('tags', e.target.value)} selectedValue={feedback.tags && feedback.tags[0]} styles={mediaQuery.isMobile && {
                    container: {
                      display: 'flex',
                      justifyContent: 'center'
                    }
                  }}/>}
                  {feedback.thumb === false && <PreselectThumbDown handleChange={e => handleChangeFeedbackData('tags', e.target.value)} selectedValue={feedback.tags && feedback.tags[0]} negativeFeedbacks={delivery?.settings?.negative_feedbacks}
                    styles={mediaQuery.isMobile && {
                      container: {
                        display: 'flex',
                        justifyContent: 'center',
                      }
                    }}
                  />}
                  {(feedback.thumb === true || feedback.thumb === false) && (
                    <>
                      <Grid item xs={12} sm={1}>
                        <strong>Other</strong>
                      </Grid>
                      <Grid item xs={12} sm={11}>
                        <TextField multiline rows={5} variant="outlined" fullWidth disabled={!canSubmit} className={classes.feedbackInput} defaultValue={feedback.comment} placeholder="Leave a comment here …" onChange={(e) => handleChangeFeedbackData('comment', e.target.value)} />
                      </Grid>
                    </>
                  )}
                </Grid>
                {store.deliveryStore.dialogErrorMsg && (
                  <Box align="center" mt={1}>
                    <Typography color='error' variant='subtitle1'>{store.deliveryStore.dialogErrorMsg}</Typography>
                  </Box>
                )}
              </Box>
            )}
            {isShowSelectPhoto && !finishUpFeedback && <SelectPreferredPhoto closeDialog={closeDialog} setFinishUpFeedback={(val) => setFinishUpFeedback(val)}/>}
          </DialogContent>
          {!finishUpFeedback && hasPackageLocation && !!images && isDisplayPackage && !(feedback.thumb === true || feedback.thumb === false)  && (
            <Box px={3}>
              <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4} className={clsx(classes.feedbackContainer, {[classes.justifyContentCenter]: mediaQuery.isMobile})}>
                    <strong>Delivery Photo(s)</strong>
                  </Grid>
                  <Grid item xs={12} sm={6} md={8} className={clsx(classes.selfCenter, {[classes.justifyContentCenter]: mediaQuery.isMobile})}>
                    <Box display={'flex'} flexDirection={'row'} flexWrap='wrap' style={{gap: '5px'}} justifyContent={mediaQuery.isMobile && 'center'}>
                      {images?.map((m, idx) => <img src={m?.url} key={`image-${idx}`} style={{maxWidth: mediaQuery.isMobile ? '30%' : '15%'}}/>)}
                    </Box>
                  </Grid>
              </Grid>
              
              <Box my={1} py={1} className={classes.underline} onClick={() => setShowPackageLocation(!showPackageLocation)}>
                <strong>Cannot find your package?</strong>
                {showPackageLocation ? <ArrowDropUpIcon className={classes.arrowIcon} /> : <ArrowDropDownIcon className={classes.arrowIcon} />}
              </Box>
              {showPackageLocation && (
                <Box>
                  <Box height={mediaQuery.isMobile ? 250 : 300} mt={2.5}>
                    <ReactMapGL
                      {...viewport}
                      dragRotate={false}
                      mapStyle={mapStyle}
                      transitionInterpolator={new LinearInterpolator()}
                      onViewportChange={(viewport) => setViewport(viewport)}
                      width="100%"
                      height="100%"
                    >
                      <DeckGL layers={layers} viewState={viewport} />
                    </ReactMapGL>
                  </Box>
                  <p>This pin shows the location of where the package was delivered.</p>
                  <p>
                    <span>If it doesn't seem to be accurate, please proceed to our </span>
                    <a href="#" onClick={openManageDelivery}>Manage Delivery</a>
                    <span> feature to update your address or location pin for future deliveries.</span>
                  </p>
                </Box>
              )}
            </Box>
          )}
          {!finishUpFeedback && !isShowSelectPhoto && (feedback.thumb === true || feedback.thumb === false) && (
            <DialogActions className={classes.dialogActionsWrapper} style={{ justifyContent: 'flex-end' }}>
              <Grid container justify={latestUpdated ? "space-between" : "flex-end"} alignItems="center" spacing={2}>
                {latestUpdated && (
                  <Grid item xs={12} sm={6}>
                    <Box className={clsx(classes.grayText, classes.feedbackSubmittedTime)}>
                      <small>{`Submitted on ${latestUpdated}`}</small>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} sm={6} style={{ textAlign: 'right', marginBottom: mediaQuery.isMobile ? 24 : 0 }}>
                  {canSubmit && (
                    <>
                      <Button onClick={handleClose} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)} disabled={isLoading}>
                        Cancel
                      </Button>
                      <Button color="primary" variant="contained" style={{ marginLeft: 5 }} className={clsx(classes.button, classes.dialogButton)} onClick={handleSubmit} disabled={isLoading || ((!feedback.tags || feedback.tags.length === 0) && (!feedback.comment || feedback.comment?.length < 5))}>
                        Submit
                      </Button>
                    </>
                  )}
                  {!canSubmit && <Box>Thank you for your feedback!</Box>}
                </Grid>
              </Grid>
            </DialogActions>
          )}
        </>
      )}
    </Box>
  );
}

const DialogFeedbackCompose = compose(inject('store'), observer)(DialogFeedback);

export default withStyles(styles)(withMediaQuery()(DialogFeedbackCompose));
