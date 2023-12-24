import React from 'react';
import clsx from 'clsx';
import { get } from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import DeckGL, { IconLayer } from 'deck.gl';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import { makeStyles } from '@material-ui/core';

import { Section, EditButton } from 'components/DeliveryManager';

import MAKRERS from 'assets/svg/markers.svg';
import HOME_MARKER from 'assets/svg/home_marker.svg';
import PARKING_MARKER from 'assets/svg/Parking_Marker.svg';
import ENTRANCE_MARKER from 'assets/svg/Entrance_Marker.svg';
import useSearchParams from 'hooks/useSearchParams';
import { ADDRESS, ADDRESS_NOT_ACCESSIBLE, COMMERCIAL_BUILDING, APARTMENT_COMPLEX } from 'constants/common';

const GEOCODE = 'GEOCODE';
const PARKING = 'PARKING';
const SHIPMENT = 'SHIPMENT';
const GATE = 'GATE';
const CURRENT_LOCATION = 'CURRENT_LOCATION';

const ICON_MAPPING = {
  [GEOCODE]: { x: 0, y: 0, width: 168, height: 224, anchorY: 210 },
  [PARKING]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [GATE]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [SHIPMENT]: { x: 690, y: 220, width: 60, height: 60 },
  [CURRENT_LOCATION]: { x: 530, y: 220, width: 60, height: 60 },
};

const MAP_STYLE = `https://api.maptiler.com/maps/topo/style.json?key=${process.env.REACT_APP_MAP_TILER_KEY}`;

const NOTES = [
  { type: GEOCODE, icon: HOME_MARKER, text: 'Address Pin', description: 'a location pin of your address' },
  { type: GATE, icon: ENTRANCE_MARKER, text: 'Entrance Pin', description: 'a specific entrance pin to your address, if applicable' },
  { type: PARKING, icon: PARKING_MARKER, text: 'Parking Pin', description: 'a convenient parking location for drivers when delivering your package' },
];

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridAutoFlow: 'row',
    gap: '1rem',
    marginTop: '1rem',
    [theme.breakpoints.up('sm')]: {
      gridAutoFlow: 'column',
      gridTemplateColumns: '1fr 1fr',
    },
  },
  map: {
    width: '100%',
    height: '350px',
    order: 1,
    [theme.breakpoints.up('sm')]: {
      order: 2,
    },
  },
  notes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    order: 2,
    [theme.breakpoints.up('sm')]: {
      order: 1,
    },
  },
  note: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f1f0fc',
    alignItems: 'center',
    height: '50px',
  },
  image: {
    width: '32px',
    height: '40px',
    objectFit: 'contain',
  },
  text: {
    color: '#4a4a4a',
    fontSize: '12px',
    fontFamily: 'AvenirNext',
    margin: 0,
  },
  description: {
    color: '#8d8d8d',
  },
  notice: {
    fontSize: '13px',
    color: '#f5a623',
    fontStyle: 'italic',
  },
}));

export const Location = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const locations = delivery?.['customer-locations'];
  const dropoff_address = delivery?.shipment?.dropoff_address;
  const addressType = get(delivery, 'recipient-questionnaire.address_type');

  const reason = searchParams.get('reason');
  const highlight = reason === ADDRESS_NOT_ACCESSIBLE;

  const dropoff = { latitude: dropoff_address.lat, longitude: dropoff_address.lng, type: SHIPMENT };
  const geocode = (locations || []).find((address) => address.type === GEOCODE);
  const parking = (locations || []).find((address) => address.type === PARKING);
  const gate = (locations || []).find((address) => address.type === GATE);
  const pins = [
    { ...dropoff, id: SHIPMENT, icon: MAKRERS, size: 40 },
    { ...geocode, id: GEOCODE, icon: HOME_MARKER },
  ];

  if (parking) pins.push({ ...parking, id: PARKING, icon: PARKING_MARKER });
  if (gate) pins.push({ ...gate, id: GATE, icon: ENTRANCE_MARKER });

  const viewport = { latitude: dropoff_address.lat, longitude: dropoff_address.lng, zoom: 16, minZoom: 16, maxZoom: 20 };

  const handleOpenDialog = () => {
    searchParams.delete('dialog');
    searchParams.set('reason', ADDRESS);
    setSearchParams(searchParams);
  };

  const renderMarker = ({ id, latitude, longitude, icon, size }) => {
    return new IconLayer({
      id: id,
      data: [{ icon: id, location: [longitude, latitude], size: size || 60 }],
      pickable: true,
      iconAtlas: icon,
      iconMapping: ICON_MAPPING,
      getIcon: (d) => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      billboard: true,
      getPosition: (d) => d.location,
      getSize: (d) => d.size,
    });
  };

  const renderNotes = () => {
    if (reason === ADDRESS_NOT_ACCESSIBLE) return <p className={classes.notice}>*Address Not Accessible - Please help us to locate your address better through location pins feature.</p>;
    if ([APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(addressType)) return <p className={classes.notice}>*For apartment complex, pins can be very useful for our drivers to find your correct address in the shortest time.</p>;
  };

  const layers = pins.filter(Boolean).map((item) => renderMarker(item));
  const visiblePinTypes = pins.map((p) => p.id);
  const visiableNotes = NOTES.filter((note) => visiblePinTypes.includes(note.type));

  return (
    <Section style={highlight ? { border: '1px solid #6c62f5' } : {}}>
      <div className="section__header">
        <span className="section__title">Location Pins:</span>
        <EditButton size="small" variant="outlined" color="primary" onClick={handleOpenDialog}>
          Edit
        </EditButton>
      </div>
      <div className={clsx({ section__body: true, [classes.container]: true })}>
        <div className={classes.map}>
          <ReactMapGL {...viewport} mapStyle={MAP_STYLE} transitionInterpolator={new LinearInterpolator()} width="100%" height="100%">
            <DeckGL layers={layers} viewState={viewport} />
          </ReactMapGL>
        </div>
        <div className={classes.notes}>
          {visiableNotes.map((note) => (
            <div className={classes.note} key={note.type}>
              <img src={note.icon} alt="" className={classes.image} />
              <div>
                <p className={classes.text}>
                  <strong>{note.text}</strong> <span className={classes.description}>({note.description})</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {renderNotes()}
    </Section>
  );
});
