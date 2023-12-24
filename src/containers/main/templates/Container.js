import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { includes } from 'lodash';
import { Grid, Container, CircularProgress, Theme } from '@material-ui/core';
import { translateEvents } from '../../../utils/events';

import * as SHIPMENT_STATUS from '../../../constants/shipmentStatus';

import DefaultProfile from './DefaultProfile';
import CustomProfile from './CustomProfile';

const TEMPLATES = {
  DefaultProfile: DefaultProfile,
  AxleHire: CustomProfile,
};

function ProfileContainer(props) {
  const [coordinates, setCoordinates] = useState(null);

  const { classes, store, match, history } = props;
  const { deliveryStore, podStore } = store;
  const {
    delivery,
    step,
    loadingDelivery,
    dialogOpened,
    dialogLoading,
    loadingProfile,
    settings,
    trackingCode,
    editedDeliveryData,
    driverEvent,
    pageTheme
  } = deliveryStore;
  const client_profile = delivery?.client_profile;

  useEffect(() => {
    if (match && match.params && match.params.tracking_code && !includes(['404', 'error'], match.params.tracking_code)) {
      window.zESettings = {
        messenger: {
          contactForm: {
            tags: [match.params.tracking_code],
          },
        },
      };

      try {
        if (window.zE) {
          window.zE('messenger:on', 'open', function () {
            window.zE('messenger', 'chat:addTags', [match.params.tracking_code]);
          });
        }
      } catch (error) {
        console.log(error.toString());
      }
      
      deliveryStore.connectWS(match.params.tracking_code);
      deliveryStore.getDelivery(match.params.tracking_code, (res) => {
        if (res.status === 404) {
          if (includes(match.url, '/noredirect/')) {
            window.location.href = `/404`;
          } else {
            window.location.href = `/`;
          }
        }

        if (res.data && res.data.shipment && res.data.shipment.dropoff_address) {
          const { shipment } = res.data;
          setCoordinates({ latitude: shipment.dropoff_address.lat, longitude: shipment.dropoff_address.lng });
        }
      });
    }

    if (window.location.href.indexOf("manage=true") > -1) {
      deliveryStore.openDialog();
    }
  }, [deliveryStore, match]);

  const closeDialog = () => {
    if(deliveryStore.lastStep) {
      deliveryStore.updateField('lastStep', false);
      podStore.updateField('isPreviewImage', true);
    }
    deliveryStore.closeDialog();
    if (window.location.href.indexOf("manage=true") > -1) {
      history.replace(`/${deliveryStore.trackingCode}`);
    }
  }

  if (loadingDelivery || loadingProfile) {
    return (
      <Container maxWidth="lg">
        <Grid style={{ height: '100vh' }} container alignItems="center" justify="center">
          <CircularProgress color="primary" />
        </Grid>
      </Container>
    );
  }

  if (!delivery) return null;

  const { client, shipment, courier, signRequired, outbound_events } = delivery;

  const milestones = outbound_events.map((e) => e.milestone).filter((m) => m);
  const milestone = milestones[0] || SHIPMENT_STATUS.PROCESSING;
  const isDelivered = milestone === SHIPMENT_STATUS.DELIVERED;

  const progress = {
    [SHIPMENT_STATUS.PROCESSING]: { left: '0', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.PROCESSED]: { left: '0', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.RECEIVED]: { left: '25%', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.RECEIVED_ALT]: { left: '25%', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: { left: '50%', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.NEXT_IN_QUEUE]: { left: '75%', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.REATTEMPTING]: { left: '75%', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.FAILED]: { right: '0', backgroundColor: pageTheme.colors.scarlet },
    [SHIPMENT_STATUS.RETURNED]: { right: '0', backgroundColor: pageTheme.colors.babyPurple },
    [SHIPMENT_STATUS.CANCELLED]: { right: '0', backgroundColor: pageTheme.colors.scarlet },
    [SHIPMENT_STATUS.DELIVERED]: { right: '0', backgroundColor: pageTheme.colors.leafyGreen },
    [SHIPMENT_STATUS.UNDELIVERABLE_SH]: { right: '0', backgroundColor: pageTheme.colors.scarlet },
  };

  const translatedEvents = translateEvents(outbound_events || [], shipment);

  const key = client_profile?.template;
  const dataProps = client_profile?.config;
  const Component = TEMPLATES[key] || TEMPLATES.DefaultProfile;

  return (
    <Component
      store={store}
      client={client}
      client_profile={client_profile}
      classes={classes}
      shipment={shipment}
      progress={progress}
      signRequired={signRequired}
      isDelivered={isDelivered}
      milestone={milestone}
      driverEvent={driverEvent}
      translatedEvents={translatedEvents}
      courier={courier}
      delivery={delivery}
      settings={settings}
      trackingCode={trackingCode}
      deliveryStore={deliveryStore}
      editedDeliveryData={editedDeliveryData}
      dialogStep={step}
      dialogOpened={dialogOpened}
      dialogLoading={dialogLoading}
      closeDialog={closeDialog}
      coordinates={coordinates}
      podStore={podStore}
      history={history}
      {...dataProps}
    />
  );
}

const ComposeComponent = compose(inject('store'), observer)(ProfileContainer);

export default withRouter(ComposeComponent);
