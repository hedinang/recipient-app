import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import clsx from "clsx";
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import DeckGL, { IconLayer } from 'deck.gl';

import {withStyles, Box, Button, Typography, DialogActions, DialogContent, DialogTitle, Grid, FormControlLabel, Checkbox} from "@material-ui/core";

import styles from './styles';
import {compose} from "recompose";
import {EDIT_NOTICE} from "../../constants/verbiage";
import MARKERS from "../../assets/svg/markers.svg";
import withMediaQuery from "../../constants/mediaQuery";

class EditLocationDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      useMyLocation: false,
      userDeniedLocation: true,
      currentLocation: {},
      viewport: {
        latitude: 37.772402,
        longitude: -122.414265,
        zoom: 16,
        maxZoom: 20,
        minZoom: 16,
      },
      mapStyle: `https://api.maptiler.com/maps/topo/style.json?key=${process.env.REACT_APP_MAP_TILER_KEY}`,
    }
  }

  componentDidMount() {
    const {delivery, editedDeliveryData} = this.props.store.deliveryStore;
    const {shipment} = delivery;

    // get user current location
    navigator.geolocation.getCurrentPosition(
      location => this.setState({
        currentLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        },
        userDeniedLocation: false,
      }),
      error => this.setState({userDeniedLocation: true})
    );

    this.setState({
      viewport: {
        ...this.state.viewport,
        latitude: editedDeliveryData.dropoff_latitude || shipment.dropoff_address.lat,
        longitude: editedDeliveryData.dropoff_longitude || shipment.dropoff_address.lng,
      }
    });
  }

  handleUseCurrentLocation = (checked) => {
    this.setState({useMyLocation: checked});
    if (checked) {
      const {viewport, currentLocation} = this.state;
      this.setState({
        viewport: {
          ...viewport,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        }
      });
    }
  };

  save = () => {
    const {deliveryStore} = this.props.store;
    const {viewport} = this.state;

    deliveryStore.setEditedDeliveryField('dropoff_latitude', viewport.latitude);
    deliveryStore.setEditedDeliveryField('dropoff_longitude', viewport.longitude);
    deliveryStore.saveAndCloseDialog();
  };

  renderMarker = (location, id) => {
    const lat = location.lat || location.latitude;
    const lng = location.lng || location.longitude;
    const iconMapping = {
      "shipment": {x: 690, y: 220, width: 60, height: 60},
      "viewport": {x: 160, y: 0, width: 160, height: 210, anchorY: 210},
      "mylocation": {x: 530, y: 220, width: 60, height: 60},
    };

    return new IconLayer({
      id: id,
      data: [{
        location: [lng, lat],
        size: id === 'viewport' ? 40 : 25,
        icon: id,
      }],
      pickable: true,
      iconAtlas: MARKERS,
      iconMapping: iconMapping,
      getIcon: d => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      billboard: false,
      getPosition: d => d.location,
      getSize: d => d.size,
    });
  };

  render() {
    const {useMyLocation, currentLocation, userDeniedLocation, viewport, mapStyle} = this.state;
    const {classes, store, mediaQuery} = this.props;
    const {deliveryStore} = store;
    const {delivery, tokenRemainingTimeString, editedDeliveryData} = deliveryStore;

    if (!delivery) return null;

    const {shipment} = delivery;
    let layers = [this.renderMarker(shipment.dropoff_address, 'shipment')];
    if (!userDeniedLocation) {
      layers = layers.concat([this.renderMarker(currentLocation, 'mylocation')]);
    }
    layers = layers.concat([this.renderMarker(viewport, 'viewport')]);

    return (
      <Box className={classes.container}>
        <DialogTitle disableTypography className={classes.titleBox}>
          <Grid container justify="space-between"
                alignItems={mediaQuery.isMobile ? 'flex-start' : 'center'}
                direction={mediaQuery.isMobile ? 'column' : 'row'}
                spacing={mediaQuery.isMobile ? 1 : 0}
          >
            <Grid item className={classes.dialogTitle}>
              <strong>Edit Location Pin</strong>
            </Grid>
            <Grid item className={classes.dialogTimer}>
              <span className={classes.underlined}>Session time:</span>
              <span className={classes.timerCounter}>{tokenRemainingTimeString}</span>
            </Grid>
          </Grid>
          <Box pt={2} pb={mediaQuery.isMobile ? 2 : 3} className={classes.noticeBox}>
            <strong>{EDIT_NOTICE}</strong>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box pt={1} pb={mediaQuery.isMobile ? 1 : 3}>
            <Typography className={clsx(classes.darkGrayText, classes.infoBox)}>
              Provide us a pin from your exact location to help us delivering your package!
            </Typography>
          </Box>
          <Box mb={3} mx={mediaQuery.isMobile ? -3 : 0} height={350}>
            <ReactMapGL
              {...viewport}
              mapStyle={mapStyle}
              transitionInterpolator={new LinearInterpolator()}
              onViewportChange={(viewport) => this.setState({viewport})}
              width="100%"
              height="100%"
            >
              <DeckGL layers={layers}
                      viewState={viewport}
              />
            </ReactMapGL>
          </Box>
          <Box className={clsx({[classes.disabled]: userDeniedLocation})}>
            <FormControlLabel
              disabled={userDeniedLocation}
              control={<Checkbox checked={useMyLocation} onChange={(e) => this.handleUseCurrentLocation(e.target.checked)} value="use_my_location" color="primary" />}
              label={<span className={classes.darkGrayText}>Use my current location</span>}
            />
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActionsWrapper}>
          <Button onClick={() => deliveryStore.closeEditDialog()} variant={mediaQuery.isMobile ? "text" : "outlined"} color="primary" className={clsx(classes.button, classes.dialogButton)}>
            Cancel
          </Button>
          <Button onClick={this.save} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
            Save
          </Button>
        </DialogActions>
      </Box>
    )
  }
}

const EditLocationDialogCompose = compose(
  inject("store"),
  observer
) (EditLocationDialog);

export default withStyles(styles)(withMediaQuery()(EditLocationDialogCompose));
