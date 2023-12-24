import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { get, cloneDeep, upperFirst } from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import DeckGL, { IconLayer } from 'deck.gl';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import { Dialog, DialogContent, Button, Tabs, Tab, FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';

import MAKRERS from 'assets/svg/markers.svg';
import HOME_MARKER from 'assets/svg/home_marker.svg';
import PARKING_MARKER from 'assets/svg/Parking_Marker.svg';
import ENTRANCE_MARKER from 'assets/svg/Entrance_Marker.svg';
import PARKING_DISABLED_MARKER from 'assets/svg/Parking_Marker_Gray.svg';
import ENTRANCE_DISABLED_MARKER from 'assets/svg/Entrance_Marker_Gray.svg';

import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import { Hr } from 'components/DeliveryManager';
import { updateLocations } from 'utils/api';
import useSearchParams from 'hooks/useSearchParams';
import { APARTMENT_COMPLEX, COMMERCIAL_BUILDING, ADDRESS_NOT_ACCESSIBLE } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'AvenirNext',
  },
  title: {
    paddingBottom: 0,
  },
  heading: {
    marginTop: 0,
    color: '#656465',
    fontFamily: 'AvenirNext-Medium',
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    marginTop: 0,

    '&__secondary': {
      color: '#626262',
    },

    '&__italic': {
      color: '#626262',
      fontStyle: 'italic',
    },
  },
  btn: {
    borderRadius: '2rem',
    marginLeft: '0 !important',
  },
  tabs: {
    marginBottom: '1rem',
  },
  tabContainer: {
    justifyContent: 'left',
  },
  tab: {
    textTransform: 'inherit',
    color: '#0f0c1b',
    fontFamily: 'AvenirNext-DemiBold',
  },
  map: {
    width: '100%',
    height: '350px',
  },
  checkbox: {
    fontFamily: 'AvenirNext',
    marginTop: '1rem',
    marginBottom: '1rem',

    '& *': {
      fontFamily: 'AvenirNext',
    },
  },
  confirm: {
    color: '#4a90e2',
    fontSize: '14px',
    textDecoration: 'underline !important',
    textTransform: 'inherit',
    fontFamily: 'AvenirNext',
    backgroundColor: 'transparent !important',
  },
  tabPanelContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
  },
  disabled: {
    opacity: 0.5,
    userSelect: 'none',
    pointerEvents: 'none',
  },
}));

const MAP_STYLE = `https://api.maptiler.com/maps/topo/style.json?key=${process.env.REACT_APP_MAP_TILER_KEY}`;

const GEOCODE = 'GEOCODE';
const PARKING = 'PARKING';
const SHIPMENT = 'SHIPMENT';
const GATE = 'GATE';
const CURRENT_LOCATION = 'CURRENT_LOCATION';
const PARKING_DISABLED = 'PARKING_DISABLED';
const GATE_DISABLED = 'GATE_DISABLED';

const ICON_MAPPING = {
  [GEOCODE]: { x: 0, y: 0, width: 168, height: 224, anchorY: 210 },
  [PARKING]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [GATE]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [SHIPMENT]: { x: 690, y: 220, width: 60, height: 60 },
  [CURRENT_LOCATION]: { x: 530, y: 220, width: 60, height: 60 },
  [PARKING_DISABLED]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [GATE_DISABLED]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`a11y-tabpanel-${index}`} aria-labelledby={`a11y-tab-${index}`} {...other}>
      {value === index && <>{children}</>}
    </div>
  );
};

export default compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pin, setPin] = useState();
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(GEOCODE);
  const [currentLocation, setCurrentLocation] = useState();
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [deniedAccessLocation, setDeniedAccessLocation] = useState(true);
  const [excludedPins, setExcludedPins] = useState([]);

  const [viewport, setViewport] = useState({ zoom: 16, minZoom: 16, maxZoom: 20 });

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const locations = get(delivery, 'customer-locations');
  const location = get(delivery, 'customer-main-location');
  const questionnaire = get(delivery, 'recipient-questionnaire');
  const addressType = get(questionnaire, 'address_type');

  const reason = searchParams.get('reason');
  const skipQuestions = searchParams.get('skip_questionnaire');

  const haveParking = [APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(addressType);
  const tabs = [
    { id: GEOCODE, label: 'Address Pin', text: 'Address Pin is where your address is located. Drag and drop the pin right at your house or apartment complex.', confirm: 'Confirm Address Pin' },
    { id: GATE, label: 'Entrance Pin', text: 'Entrance Pin is the location of a specific entrance to your address. Drag and drop the pin at the specific entrance of your address.', confirm: 'Confirm Entrance Pin', exclude_text: 'Entrance pin not applicable', exclude_value: GATE },
  ];

  if (haveParking) tabs.push({ id: PARKING, label: 'Parking Pin', text: 'Parking Pin is the pin for the driver to park. Drag and drop the parking pin to inform drivers the best parking area when delivering your package.', confirm: 'Confirm Parking Pin', exclude_text: 'Parking pin not applicable', exclude_value: PARKING });
  const disabledPin = excludedPins.includes(selectedPin);

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

  const shipmentPin = pins.find((p) => p.id === SHIPMENT);
  const currentLocationPin = currentLocation && useCurrentLocation ? { id: CURRENT_LOCATION, latitude: currentLocation.latitude, longitude: currentLocation.longitude, icon: MAKRERS, size: 40 } : undefined;
  const layers = [shipmentPin, currentLocationPin, pin].filter(Boolean).map((item) => renderMarker(item));

  const handleChangeTab = (_, tab) => {
    setSelectedPin(tab);
    const selectedPin = pins.find((p) => p.id === tab);
    setPin(selectedPin);
    setUseCurrentLocation(false);
    setViewport((previous) => ({ ...previous, latitude: selectedPin.latitude, longitude: selectedPin.longitude }));
  };

  const handleChangeViewport = (viewState) => {
    const clonedPin = cloneDeep(pin);
    clonedPin.icon = pin.id === GATE ? ENTRANCE_MARKER : pin.id === PARKING ? PARKING_MARKER : clonedPin.icon;

    setViewport(viewState);
    setPin({ ...clonedPin, latitude: viewState.latitude, longitude: viewState.longitude });
  };

  const handleConfirmPin = () => {
    const { latitude, longitude, type } = pin;
    const clonedPins = cloneDeep(pins);
    const icon = type === GATE ? ENTRANCE_MARKER : type === PARKING ? PARKING_MARKER : pin.icon;
    const index = clonedPins.findIndex((p) => p.id === selectedPin);
    clonedPins[index] = { ...clonedPins[index], latitude, longitude, icon };

    setPins(clonedPins);
  };

  const renderTitle = () => {
    if (reason === ADDRESS_NOT_ACCESSIBLE) return 'Unsuccessful Delivery - Address Not Accessible';

    if ([APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(addressType)) return 'Apartments - Location Pins';

    return 'Location Pins';
  };

  const renderText = () => {
    if (reason === ADDRESS_NOT_ACCESSIBLE) return "We're sorry that your previous shipment wasn't successfully delivered. Help guide our drivers with helpful pins to get your package to your address!";

    if ([APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(addressType)) return 'Apartments can be more challenging for drivers in the delivery process. Help guide our drivers with helpful pins to get your package to your address!';

    return 'While AxleHire will attempt to complete your delivery change requests, you will not be able to update the scheduled delivery date.';
  };

  const handleUseCurrentLocation = (checked) => {
    setUseCurrentLocation(checked);

    if (!checked) return;
    if (deniedAccessLocation)
      return toast.error(
        <span className={classes.notice}>
          Please allow <strong>AxleHire</strong> access your location
        </span>,
        { theme: 'colored', hideProgressBar: true }
      );

    if (currentLocation) {
      const { latitude, longitude } = currentLocation;
      setPin((previous) => ({ ...previous, latitude, longitude }));
      setViewport((previous) => ({ ...previous, latitude, longitude }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const { latitude, longitude } = location.coords;

        setCurrentLocation(location.coords);
        setPin((previous) => ({ ...previous, latitude, longitude }));
        setViewport((previous) => ({ ...previous, latitude, longitude }));
      },
      () =>
        toast.error(
          <span className={classes.notice}>
            Please allow <strong>AxleHire</strong> access your location. After that, you need refresh page.
          </span>,
          { theme: 'colored', hideProgressBar: true }
        )
    );
  };

  const handleChangeExcludePins = (e) => {
    const { checked, value } = e.target;
    const ignorePins = checked ? Array.from(new Set([...excludedPins, value])) : excludedPins.filter((p) => p !== value);

    const clonedPin = cloneDeep(pin);
    let icon = clonedPin.icon;
    if (value === GATE) icon = checked ? ENTRANCE_DISABLED_MARKER : ENTRANCE_MARKER;
    if (value === PARKING) icon = checked ? PARKING_DISABLED_MARKER : PARKING_MARKER;
    clonedPin.icon = icon;

    setPin(clonedPin);
    setExcludedPins(ignorePins);
  };

  const handleSubmit = () => {
    const { shipment } = delivery;
    const { id } = shipment;
    const filters = haveParking ? [GEOCODE, GATE, PARKING] : [GEOCODE, GATE];
    const filteredPins = pins.filter((p) => filters.includes(p.type) && !excludedPins.includes(p.type)).map(({ type, latitude, longitude }) => ({ type, latitude, longitude }));
    updateLocations(trackingCode, id, filteredPins)
      .then((response) => {
        if (response.status !== 200) return toast.error(<span className={classes.notice}>{upperFirst(get(response, 'data.message', 'Something went wrong. Please try again!'))}</span>, { theme: 'colored', hideProgressBar: true });

        deliveryStore.getDelivery(trackingCode);
        searchParams.set('dialog', 'closed');
        if (!skipQuestions) searchParams.set('skip_questionnaire', 'skippable');
        setSearchParams(searchParams);
      })
      .catch((error) => toast.error(<span className={classes.notice}>{error.message}</span>, { theme: 'colored', hideProgressBar: true }));
  };

  const handleCancel = () => {
    searchParams.set('dialog', 'closed');

    if (!skipQuestions) searchParams.set('skip_questionnaire', 'skippable');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const latitude = get(location, 'latitude');
    const longitude = get(location, 'longitude');

    const dropoff = { latitude, longitude, type: SHIPMENT, icon: MAKRERS };
    const geocode = locations.find((address) => address.type === GEOCODE);
    const parking = locations.find((address) => address.type === PARKING);
    const gate = locations.find((address) => address.type === GATE);

    const geocodePin = geocode ? { ...geocode, icon: HOME_MARKER } : { latitude, longitude, type: GEOCODE, icon: HOME_MARKER };
    const parkingPin = parking ? { ...parking, icon: PARKING_MARKER } : { latitude, longitude, type: PARKING, icon: PARKING_DISABLED_MARKER };
    const gatePin = gate ? { ...gate, icon: ENTRANCE_MARKER } : { latitude, longitude, type: GATE, icon: ENTRANCE_DISABLED_MARKER };

    const ignorePins = [];
    if (!gate) ignorePins.push(GATE);
    if (!parking) ignorePins.push(PARKING);

    setPins([
      { ...dropoff, id: SHIPMENT, size: 40 },
      { ...geocodePin, id: GEOCODE },
      { ...parkingPin, id: PARKING },
      { ...gatePin, id: GATE },
    ]);
    setPin({ ...geocodePin, id: GEOCODE, icon: HOME_MARKER });
    setExcludedPins(ignorePins);
    setViewport((previous) => ({ ...previous, latitude, longitude }));
  }, [locations, location]);

  useEffect(() => {
    const useCurrentLocation = async () => {
      const permission = await navigator?.permissions?.query({ name: 'geolocation' });
      const denied = permission?.state === 'denied';
      setDeniedAccessLocation(denied);

      if (permission?.state === 'granted') navigator.geolocation.getCurrentPosition(({ coords }) => setCurrentLocation(coords));
    };

    useCurrentLocation();
  }, []);

  return (
    <Dialog open maxWidth="md" fullWidth className={classes.root}>
      <DialogHeader title={renderTitle()} />
      <DialogContent>
        <p className={classes.text}>{renderText()}</p>
        <Hr />
        <p className={clsx(classes.text, `${classes.text}__secondary`)}>Select each pin type below to drag and drop it on the map for exact location.</p>
        <Tabs value={selectedPin} indicatorColor="primary" textColor="inherit" classes={{ root: classes.tabs, flexContainer: classes.tabContainer }} onChange={handleChangeTab}>
          {tabs.map((tab) => (
            <Tab key={tab.label} value={tab.id} label={tab.label} className={classes.tab} />
          ))}
        </Tabs>
        {tabs.map((tab) => (
          <TabPanel key={tab.id} value={selectedPin} index={tab.id}>
            <p className={clsx(classes.text, `${classes.text}__italic`)}>{tab.text}</p>
            {tab.exclude_text && <FormControlLabel className={classes.checkbox} control={<Checkbox checked={excludedPins.includes(tab.exclude_value)} onChange={(e) => handleChangeExcludePins(e)} color="primary" value={tab.exclude_value} />} label={tab.exclude_text} />}
          </TabPanel>
        ))}
        <div className={clsx({ [classes.map]: true, [classes.disabled]: disabledPin })}>
          <ReactMapGL {...viewport} mapStyle={MAP_STYLE} transitionInterpolator={new LinearInterpolator()} width="100%" height="100%" onViewportChange={handleChangeViewport}>
            <DeckGL layers={layers} viewState={viewport} />
          </ReactMapGL>
        </div>
        <FormControlLabel disabled={deniedAccessLocation || disabledPin} className={classes.checkbox} control={<Checkbox checked={useCurrentLocation} onChange={(e) => handleUseCurrentLocation(e.target.checked)} color="primary" />} label="Use my current Location" />
        <div className={classes.tabPanelContainer}>
          {tabs.map((tab) => (
            <TabPanel key={tab.id} value={selectedPin} index={tab.id}>
              <Button disabled={disabledPin} size="small" variant="text" className={classes.confirm} onClick={handleConfirmPin} disableElevation>
                {tab.confirm}
              </Button>
            </TabPanel>
          ))}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={handleSubmit} fullWidth className={classes.btn} size="medium" color="primary" variant="contained" disableElevation>
          Save
        </Button>
        <Button onClick={handleCancel} fullWidth className={classes.btn} size="medium" color="primary" variant="outlined" disableElevation>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
});
