import _ from 'lodash';

// Utils
import * as SHIPMENT_STATUS from '../constants/shipmentStatus';
import {VERBIAGE} from "../constants/verbiage";
import moment from "moment";

function translateEvents(originalEvents, shipment) {
  let translatedEvents = _.map(originalEvents
    .filter(oe => oe.ts)
    .sort((e1, e2) => new Date(e2.ts).getTime() - new Date(e1.ts).getTime()
    ), _.clone);
  let pastSignals = [];
  translatedEvents.slice().reverse().forEach(ev => {
    ev.pastSignals = (ev.pastSignals || []).concat(pastSignals);
    if (ev.signal === SHIPMENT_STATUS.RECEIVED_OK && pastSignals.includes(SHIPMENT_STATUS.GEOCODE_FAILED)) {
      ev.convertedSignal = 'RECEIVED_OK__GEOCODE_FAILED';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED && pastSignals.includes(SHIPMENT_STATUS.MISSING)) {
      ev.convertedSignal = 'PICKUP_FAILED__MISSING';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED && pastSignals.includes(SHIPMENT_STATUS.RECEIVED_OK)) {
      ev.convertedSignal = 'PICKUP_FAILED__RECEIVED_OK';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED && pastSignals.includes(SHIPMENT_STATUS.RECEIVED_DAMAGED)) {
      ev.convertedSignal = 'PICKUP_FAILED__RECEIVED_DAMAGED';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED) {
      ev.convertedSignal = 'PICKUP_FAILED__UNSCANNED';
    }  else if (ev.signal === SHIPMENT_STATUS.PICKUP_SUCCEEDED && pastSignals.includes(SHIPMENT_STATUS.DROPOFF_FAILED)) {
      ev.convertedSignal = 'PICKUP_SUCCEEDED__REATTEMPT';
    } else if(ev.signal === SHIPMENT_STATUS.DROPOFF_FAILED && _.countBy(pastSignals)[SHIPMENT_STATUS.PICKUP_SUCCEEDED] > 1) {
      ev.convertedSignal = 'UNDELIVERABLE';
    } else if (ev.signal === SHIPMENT_STATUS.DROPOFF_FAILED && pastSignals.includes(SHIPMENT_STATUS.DROPOFF_FAILED)) {
      ev.convertedSignal = 'DROPOFF_FAILED__REATTEMPT';
    } else if (ev.signal === SHIPMENT_STATUS.DROPOFF_SUCCEEDED && pastSignals.includes(SHIPMENT_STATUS.DROPOFF_FAILED)) {
      ev.convertedSignal = 'DROPOFF_SUCCEEDED__REATTEMPT';
    } else if (ev.signal === SHIPMENT_STATUS.UNDELIVERABLE) {
      ev.convertedSignal = 'UNDELIVERABLE';
    } else if (ev.signal === SHIPMENT_STATUS.DISPOSABLE) {
      ev.convertedSignal = 'DISPOSABLE';
    } else {
      ev.convertedSignal = ev.signal;
    }
    pastSignals.push(ev.signal);
  });

  // Handle the case missing but inbound lock does not populate event
  if (translatedEvents.length === 0 && shipment.status === SHIPMENT_STATUS.PICKUP_FAILED) {
    translatedEvents.unshift({
      shipment_id: shipment.id,
      convertedSignal: 'PICKUP_FAILED__MISSING',
      ts: shipment.dropoff_earliest_ts
    })
  }

  return translatedEvents;
}

const renderDeliveryTimeAndLabel = (milestone, events, shipment, settings) => {
  const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
  const timeAndLabel = {
    time: '',
    label: 'Scheduled Delivery on:',
  };
  const eventTsList = events.filter(e => VERBIAGE[e.convertedSignal]).map(e => e.ts);
  const latestEventTs = eventTsList[0] || shipment.dropoff_latest_ts;

  switch (milestone) {
    case SHIPMENT_STATUS.PROCESSING:
        if ( settings.hide_delivery_datetime === 'true'){
              timeAndLabel.label = '';
              timeAndLabel.time = '';
              break;
        }
    case SHIPMENT_STATUS.PROCESSED:
        if ( settings.hide_delivery_datetime === 'true'){
          timeAndLabel.label = '';
          timeAndLabel.time = '';
          break;
      }
    case SHIPMENT_STATUS.RECEIVED:
    case SHIPMENT_STATUS.OUT_FOR_DELIVERY:
    case SHIPMENT_STATUS.NEXT_IN_QUEUE:
    default:
      const fromDate = moment(shipment.dropoff_earliest_ts).tz(timezone).format('MM/DD/YYYY');
      const fromTime = moment(shipment.dropoff_earliest_ts).tz(timezone).format('hh:mm A');
      const toDate = moment(shipment.dropoff_latest_ts).tz(timezone).format('MM/DD/YYYY');
      const toTime = moment(shipment.dropoff_latest_ts).tz(timezone).format('hh:mm A');

      timeAndLabel.label = 'Scheduled Delivery on:';
      timeAndLabel.time = fromDate === toDate
        ? `${fromDate}, ${fromTime} - ${toTime}`
        : `${fromDate} ${fromTime} - ${toDate} ${toTime}`;
      break;
    case SHIPMENT_STATUS.FAILED:
      timeAndLabel.label = 'Attempted on:';
      timeAndLabel.time = moment(latestEventTs).tz(timezone).format('MM/DD/YYYY hh:mm A');
      break;
    case SHIPMENT_STATUS.DELIVERED:
      timeAndLabel.label = 'Delivered on:';
      timeAndLabel.time = moment(latestEventTs).tz(timezone).format('MM/DD/YYYY hh:mm A');
      break;
  }

  return timeAndLabel;
};

export {
  translateEvents,
  renderDeliveryTimeAndLabel,
}
