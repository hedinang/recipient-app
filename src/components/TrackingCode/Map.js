import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { observe, reaction } from 'mobx';
import { capitalize } from 'lodash';
import DeckGL, { IconLayer } from 'deck.gl';
import ReactMapGL, { LinearInterpolator, Popup } from 'react-map-gl';
import WebMercatorViewport from '@math.gl/web-mercator';
import { Box, Grid, Container } from '@material-ui/core';

import MARKERS from '../../assets/svg/markers.svg';
import HOME_MARKERS from '../../assets/svg/home_marker.svg';
import { isoToLocalHuman } from '../../utils/calendar';
import * as SHIPMENT_STATUS from '../../constants/shipmentStatus';
import PACKAGE_MARKERS from '../../assets/svg/package_marker.svg';
import POD_MARKERS from '../../assets/svg/POD_pin.svg';
import './mapgl.css'

const mapStyle = `https://api.maptiler.com/maps/topo/style.json?key=${process.env.REACT_APP_MAP_TILER_KEY}`;

function Map(props) {
  const [viewport, setViewport] = useState({
    latitude: 37.772402,
    longitude: -122.414265,
    zoom: 15,
    width: 400,
    height: 400,
    maxZoom: 16,
    minZoom: 8,
  });

  const { mediaQuery, classes, milestone, delivery, settings, editedDeliveryData, driverEvent, deliveryStore, coordinates, podStore } = props;

  const { driver, shipment, dropoff, pickup } = delivery;
  const [images, setImages] = useState([]);
  const [selectedPOD, setSelectedPOD] = useState({});
  const [packageLocationPin, setPackageLocationPin] = useState(null);

  reaction(
    () => podStore.imagesPOD,
    () => setImages(podStore.imagesPOD)
  )

  reaction(
    () => deliveryStore.packageLocation,
    () => setPackageLocationPin(deliveryStore.packageLocation)
  )

  const fitMap = (center, location) => {
    const dx = Math.max(Math.abs(center.latitude - location.latitude), 0.002);
    const dy = Math.max(Math.abs(center.longitude - location.longitude), 0.002);

    if (!viewport.width) return;

    const wmv = new WebMercatorViewport(viewport);
    const { longitude, latitude, zoom } = wmv.fitBounds(
      [
        [center.longitude - dy, center.latitude - dx],
        [center.longitude + dy, center.latitude + dx],
      ],
      { padding: 40 }
    );

    setViewport({
      ...viewport,
      longitude,
      latitude,
      zoom,
      transitionDuration: 200,
      transitionInterpolator: new LinearInterpolator(),
    });
  };

  useEffect(() => {
    observe(deliveryStore, 'driverEvent', (change) => {
      if (!change || !change.newValue) return;

      try {
        fitMap({ latitude: shipment.dropoff_address.lat, longitude: shipment.dropoff_address.lng }, change.newValue.geolocation);
      } catch (e) {}
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!coordinates) return;

    setViewport({ ...viewport, longitude: coordinates.longitude, latitude: coordinates.latitude });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates]);

  const renderMarker = (location) => {
    return new IconLayer({
      id: 'shipment-marker',
      data: [
        {
          location: [location.lng || location.dropoff_longitude, location.lat || location.dropoff_latitude],
          size: 40,
          icon: 'green',
        },
      ],
      pickable: true,
      iconAtlas: HOME_MARKERS,
      iconMapping: {
        green: { x: 0, y: 0, width: 168, height: 228, anchorY: 228 },
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

  const renderDriverLocation = (event, settings) => {
    if (settings.tracking_show_driver_location !== 'true') return null;
    if (!event) return null;

    const data = [
      {
        size: 20,
        location: [event.geolocation.longitude, event.geolocation.latitude],
      },
    ];

    const iconMapping = {
      shipment: { x: 690, y: 220, width: 60, height: 60 },
      viewport: { x: 160, y: 0, width: 160, height: 210, anchorY: 210 },
      mylocation: { x: 530, y: 220, width: 60, height: 60 },
    };

    return new IconLayer({
      id: 'driver-location',
      data: data,
      pickable: false,
      iconAtlas: MARKERS,
      iconMapping: iconMapping,
      getIcon: (d) => 'mylocation',
      sizeScale: 1,
      opacity: 1,
      visible: true,
      billboard: false,
      getPosition: (d) => d.location,
      getSize: (d) => d.size,
    });
  };


  const handleSelectPOD = (info) => {
    if(!info) return null;

    if(info.picked) {
      setSelectedPOD(info);
    }
    else {
      setSelectedPOD({})
    }
  }

  const renderImagesPOD = () => {
    return new IconLayer({
      id: 'image-pod-layer',
      data: images?.map(img => ({
        location: [img?.geolocation?.longitude, img?.geolocation?.latitude],
        size: 48,
        icon: 'green',
        url: img?.url
      })),
      getIcon: d => d.icon,
      getSize: d => d.size,
      pickable: true,
      iconAtlas: POD_MARKERS,
      iconMapping: {
        green: { x: 0, y: 0, width: 47, height: 61, anchorY: 61 },
      },
      getPosition: d => d.location,
      onClick: (info) => handleSelectPOD(info),
    });
  }

  const renderPackageLocationPOD = () => {
    return new IconLayer({
      id: 'image-package-location-layer',
      data: [{
        location: images && images.length > 0 ? [packageLocationPin?.longitude, packageLocationPin?.latitude] : [],
        size: 48,
        icon: 'green',
      }],
      getIcon: d => d.icon,
      getSize: d => d.size,
      pickable: true,
      iconAtlas: PACKAGE_MARKERS,
      iconMapping: {
        green: { x: 0, y: 0, width: 64, height: 83, anchorY: 83 },
      },
      getPosition: d => d.location,
    });
  }

  const layers = editedDeliveryData.dropoff_latitude && editedDeliveryData.dropoff_longitude ? [renderMarker(editedDeliveryData), renderDriverLocation(driverEvent, settings), renderPackageLocationPOD(), renderImagesPOD()] : [renderMarker(shipment.dropoff_address), renderDriverLocation(driverEvent, settings), renderPackageLocationPOD(), renderImagesPOD()];

  let etaInTime = '';
  const inProgress = pickup && pickup.status === 'SUCCEEDED';
  if (dropoff && dropoff.status === 'SUCCEEDED') {
    etaInTime = 'Delivered';
  } else if (dropoff && (dropoff.status === 'FAILED' || dropoff.status === 'DISCARDED')) {
    etaInTime = '-';
  } else if (SHIPMENT_STATUS.FAILED === milestone) {
    etaInTime = '-';
  } else if (inProgress && dropoff.estimated_arrival_ts) {
    const eta = moment(dropoff.estimated_arrival_ts).diff(moment.now());
    if (eta < 0) {
      etaInTime = '-';
    } else {
      const etaInSeconds = Math.ceil(eta / 1000);
      const etaInMinutes = Math.ceil(etaInSeconds / 60);
      const roundUp = Math.max(0, Math.floor((etaInMinutes + 4) / 5) * 5);
      const minutes = roundUp % 60;
      const hours = Math.floor(roundUp / 60);
      etaInTime = `about ${hours > 0 ? `${hours}h ` : ''}` + minutes + 'm';
    }
  } else {
    etaInTime = 'by ' + isoToLocalHuman(shipment.dropoff_latest_ts, shipment.timezone || 'America/Los_Angeles', shipment.dropoff_latest_ts, 'hA MM/DD/YYYY');
    if ( settings.hide_delivery_datetime === 'true' && (SHIPMENT_STATUS.PROCESSING === milestone || SHIPMENT_STATUS.PROCESSED === milestone)){
                    etaInTime = "N/A";
     }
  }

  function renderModal(info) {
    if(!info) return null;

    const {object} = info;
    if (!object) {
      return null;
    }

    const {url, location} = object;
    if(!url || !location[0] || !location[1]) {
      return null;
    }

    return (
      <Popup 
          tipSize={5}
          anchor="bottom"
          longitude={location[0]}
          latitude={location[1]}
          closeOnClick={false}
          offsetTop={-8}
          onClose={() => setSelectedPOD(null)}
        >
          <div style={{marginTop: '10px'}}>
            <img src={url} style={{maxHeight: '100px'}}/>
          </div>
        </Popup>
    );
  }

  return (
    <Grid item xs={12} sm={6} className={classes.bodyItemWrapper}>
      <Container className={clsx(classes.bodyBottomItem, classes.boxWrapper)}>
        <Grid container justify="space-between">
          <Grid item xs={7}>
            <div className={classes.grayTextWithMarginBtm}>ETA</div>
            <div className={classes.boldText}>{etaInTime}</div>
          </Grid>
          {settings.hide_delivery_vehicle_info !== 'true' && (
            <Grid item xs={5} style={{ textAlign: 'right' }}>

              <div className={classes.grayTextWithMarginBtm}>Delivery Vehicle</div>
              <div className={classes.boldText}>{!!driver ? `${capitalize(driver.vehicle_make)} ${capitalize(driver.vehicle_model)}` : 'N/A'}</div>
            </Grid>
          )}
        </Grid>
        {settings.tracking_show_map === 'true' && (
          <Box height={mediaQuery.isMobile ? 250 : 500} mt={2.5}>
            <ReactMapGL {...viewport} mapStyle={mapStyle} transitionInterpolator={new LinearInterpolator()} onViewportChange={(viewport) => setViewport(viewport)} width="100%" height="100%">
              <DeckGL layers={layers} viewState={viewport} />
              {renderModal(selectedPOD)}
            </ReactMapGL>
          </Box>
        )}
        {settings.tracking_show_map !== 'true' && mediaQuery.isMobile && (
          <Box
            style={{
              marginTop: 35,
              height: 1,
              width: '100%',
              backgroundColor: '#ccc',
            }}
          />
        )}
      </Container>
    </Grid>
  );
}

export default Map;
