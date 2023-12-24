import React, { Fragment } from 'react';
import { Box, Grid, Container, withStyles, useMediaQuery } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';

import withMediaQuery from '../../../constants/mediaQuery';
import styles from '../styles';
import Map from '../../../components/TrackingCode/Map';
import FAQ from '../../../components/TrackingCode/FAQ';
import Event from '../../../components/TrackingCode/Event';
import Progress from '../../../components/TrackingCode/Progress';
import ShipmentInfo from '../Shipment';
import ManageDelivery from '../../../components/TrackingCode/ManageDelivery';
import NoTouchDelivery from '../../../components/TrackingCode/NoTouchDelivery';
import MainDialog from '../Dialog';
import Footer from '../../../components/Footer';
import DialogStepOne from '../../../components/TrackingCode/Dialogs/DialogStepOne';
import DialogStepTwo from '../../../components/TrackingCode/Dialogs/DialogStepTwo';

function DefaultProfile(props) {
  const { classes, store, mediaQuery, signRequired, client, client_profile, shipment, coordinates, progress, isDelivered, milestone, translatedEvents, courier, delivery, deliveryStore, settings, trackingCode, editedDeliveryData, driverEvent, dialogStep, dialogOpened, dialogLoading, closeDialog, podStore, history } = props;
  const {currentStep} = podStore;
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('xs'));

  const handleNext = (v) => {
    podStore.updateCurrentStep(v);
  }

  const handleCancel = () => {
    podStore.updateIsRequested(false);
    podStore.updateCurrentStep(0);
  }

  const handleGetPOD = () => {
    podStore.updateCurrentStep(0);
  }

  return (
    <Container maxWidth={false} disableGutters className={classes.container}>
      {((isMobile && ![1,2].includes(currentStep)) || !isMobile) && (
        <Fragment>
          {signRequired && settings && <NoTouchDelivery classes={classes} />}
          <Container className={classes.bodyContainer}>
            <Box mb={mediaQuery.isMobile ? 2 : 3} className={classes.boxWrapper}>
              <Progress mediaQuery={mediaQuery} classes={classes} shipment={shipment} progress={progress} milestone={milestone} />
              <ShipmentInfo store={store} client={client} client_profile={client_profile} classes={classes} mediaQuery={mediaQuery} settings={settings} courier={courier} shipment={shipment} milestone={milestone} isDelivered={isDelivered} trackingCode={trackingCode} translatedEvents={translatedEvents} editedDeliveryData={editedDeliveryData} />
            </Box>

            {!isDelivered && <ManageDelivery classes={classes} store={store} mediaQuery={mediaQuery} />}

            <Box mb={4}>
              <Grid container spacing={mediaQuery.isMobile ? 0 : 2} className={classes.eventsAndMap}>
                <Map mediaQuery={mediaQuery} classes={classes} milestone={milestone} delivery={delivery} settings={settings} driverEvent={driverEvent} editedDeliveryData={editedDeliveryData} deliveryStore={deliveryStore} coordinates={coordinates} podStore={podStore}/>
                <Event classes={classes} delivery={delivery} progress={progress} translatedEvents={translatedEvents} deliveryStore={deliveryStore} podStore={podStore} history={history}/>
              </Grid>
            </Box>
            {/* <FAQ /> */}
          </Container>
        </Fragment>
      )}
      { isMobile && currentStep === 1 && <DialogStepOne handleClose={handleCancel} delivery={delivery} handleNext={v => handleNext(v)}/>}
      { isMobile && currentStep === 2 && <DialogStepTwo handleClose={handleCancel} delivery={delivery} handleNext={v => handleGetPOD(v)}/>}
      {(!settings || !settings.hide_footer || settings.hide_footer === 'false') && <Footer settings={settings} client={client} />}

      <MainDialog store={store} classes={classes} mediaQuery={mediaQuery} step={dialogStep} open={dialogOpened} loading={dialogLoading} closeDialog={closeDialog} />
    </Container>
  );
}
const DefaultProfileCompose = compose(
  inject("store"),
  observer
) (DefaultProfile);

export default withStyles(styles)(withMediaQuery()(DefaultProfileCompose));
