import React from 'react';
import moment from 'moment';

import { isToday } from '../../../utils/calendar';
import * as SHIPMENT_STATUS from '../../../constants/shipmentStatus';
import { renderDeliveryTimeAndLabel } from '../../../utils/events';

import Shipment from './Shipment';

const SHIPMENT_TEMPLATES = {
  Shipment: Shipment,
}

function MainContainer(props) {
  const {
    store,
    client,
    client_profile,
    classes,
    mediaQuery,
    courier,
    settings,
    shipment,
    milestone,
    isDelivered,
    trackingCode,
    translatedEvents,
    editedDeliveryData,
    component,
  } = props;

  let canTip = false;
  if (settings) {
    if (settings.enable_tip && settings.enable_tip === 'false') {
      canTip = false;
    } else if (settings.allow_tipping_dsp_driver && settings.allow_tipping_dsp_driver === 'false' && courier) {
      canTip = false;
    } else if (!!settings.disable_tipping_dsp_list && courier) {
      const disabledDspList = settings.disable_tipping_dsp_list.split(',');
      canTip = !disabledDspList.includes(courier.id.toString());
    } else {
      canTip = true;
    }
  } else {
    canTip = true;
  }
 let useDriverFeedBack = false;
 if (settings){
    if (settings.use_driver_feedback && settings.use_driver_feedback === 'true') {
          useDriverFeedBack = true;
    }
 }

 let hideCompanyBranding = false;
  if (settings){
     if (settings.hide_company_branding && settings.hide_company_branding === 'true') {
           hideCompanyBranding = true;
     }
  }

  let preferredWindow = '';
  let originalFromTime = '';
  let originalToTime = '';

  if (!!editedDeliveryData.dropoff_earliest_ts && [SHIPMENT_STATUS.FAILED, SHIPMENT_STATUS.DELIVERED].indexOf(milestone) < 0) {
    const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
    const preferredDate = moment(editedDeliveryData.dropoff_earliest_ts).tz(timezone).format('MM/DD/YYYY');
    const fromTime = moment(editedDeliveryData.dropoff_earliest_ts).tz(timezone).format('hh:mm A');
    const toTime = moment(editedDeliveryData.dropoff_latest_ts).tz(timezone).format('hh:mm A');
    const isPreferredToday = isToday(timezone, editedDeliveryData.dropoff_earliest_ts);

    preferredWindow = `${isPreferredToday ? 'Today' : preferredDate}, ${fromTime} - ${toTime}`;
    originalFromTime = moment(shipment.dropoff_earliest_ts).tz(timezone).format('hh:mm A');
    originalToTime = moment(shipment.dropoff_latest_ts).tz(timezone).format('hh:mm A');
  }

  const deliveryTimeAndLabel = renderDeliveryTimeAndLabel(milestone, translatedEvents, shipment, settings);
  let name = client?.company;
  let logo = client?.logo_url;

  if (client_profile?.is_use_profile_name) name = client_profile.name;
  if (client_profile?.is_use_profile_logo) logo = client_profile.logo;

  const Component = SHIPMENT_TEMPLATES[component] || SHIPMENT_TEMPLATES.Shipment;

  return (
    <Component
      store={store}
      name={name}
      logo={logo}
      classes={classes}
      mediaQuery={mediaQuery}
      shipment={shipment}
      isDelivered={isDelivered}
      trackingCode={trackingCode}
      canTip={canTip}
      preferredWindow={preferredWindow}
      originalFromTime={originalFromTime}
      originalToTime={originalToTime}
      deliveryTimeAndLabel={deliveryTimeAndLabel}
      useDriverFeedBack={useDriverFeedBack}
      hideCompanyBranding={hideCompanyBranding}
    />
  );
}

export default MainContainer;
