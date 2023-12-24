import React from 'react';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Avatar, makeStyles } from '@material-ui/core';

import { VERBIAGE } from 'constants/verbiage';
import * as SHIPMENT_STATUS from 'constants/shipmentStatus';
import { translateEvents, renderDeliveryTimeAndLabel } from 'utils/events';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  title: {
    margin: 0,
    color: '#5a5a5a',
    fontWeight: 'normal',
    textDecoration: 'underline',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  status: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  label: {
    margin: '0 0 0.25rem 0',
    color: '#aeaeae',
    fontSize: '14px',
  },
  value: {
    color: '#656465',
    fontSize: '14px',
    fontWeight: 700,
  },
});

export const Overview = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const { deliveryStore } = store;
  const { delivery, settings, hideCompanyBranding } = deliveryStore;
  if (!delivery || !settings) return;

  const { client, shipment, outbound_events } = delivery;
  const translatedEvents = translateEvents(outbound_events || [], shipment);
  const milestones = translatedEvents.filter((e) => VERBIAGE[e.convertedSignal]).map((e) => VERBIAGE[e.convertedSignal].milestone);
  const milestone = milestones[0] || SHIPMENT_STATUS.PROCESSING;
  const status = renderDeliveryTimeAndLabel(milestone, translatedEvents, shipment, settings);

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>Current Shipment Details</h3>
      {hideCompanyBranding ? null : (
        <div className={classes.logo}>
          <Avatar src={client.logo_url} variant="square" alt={client.company} />
          <span>{client.company}</span>
        </div>
      )}
      <div className={classes.status}>
        <div>
          <p className={classes.label}>Status:</p>
          <span className={classes.value}>{milestone}</span>
        </div>
        <div>
          <p className={classes.label}>{status.label}</p>
          <span className={classes.value}>{status.time}</span>
        </div>
      </div>
    </div>
  );
});
