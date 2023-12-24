import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import clsx from 'clsx';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import DeckGL, { IconLayer } from 'deck.gl';
import moment from "moment";
import 'moment-timezone';

import {withStyles, Box, Container, Button, Typography, Grid, Avatar, Dialog, CircularProgress, DialogTitle, DialogContent, DialogActions} from "@material-ui/core";

import styles from './styles';
import FooterContainer from "../../components/Footer";
import {getCookie} from "../../utils/cookie";
import {renderDeliveryTimeAndLabel, translateEvents} from "../../utils/events";
import {EDIT_NOTICE, VERBIAGE} from "../../constants/verbiage";
import * as SHIPMENT_STATUS from "../../constants/shipmentStatus";
import MARKERS from "../../assets/svg/home_marker.svg";
import EditWindowDialog from "./EditWindowDialog";
import EditAddressDialog from "./EditAddressDialog";
import EditInstructionDialog from "./EditInstructionDialog";
import EditSignatureOptionDialog from "./EditSignatureOptDialog";
import EditLocationDialog from "./EditLocationDialog";
import withMediaQuery from "../../constants/mediaQuery";
import SignatureContainer from '../signature';
import _ from "lodash";

class EditShipmentContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showNotice: true,
            viewport: {
                latitude: 37.772402,
                longitude: -122.414265,
                zoom: 16
            },
            mapStyle: `https://api.maptiler.com/maps/topo/style.json?key=${process.env.REACT_APP_MAP_TILER_KEY}`,
        }
    }

    componentDidMount() {
        const {store, match} = this.props;
        const {deliveryStore} = store;
        const {delivery, token, editedDeliveryData} = deliveryStore;
        const queryParams = new URLSearchParams(window.location.search);

        let tokenId = queryParams.get('axl_shipment_token') || queryParams.get('t');
        if (!tokenId) {
            tokenId = getCookie("axl_shipment_token");
        }

        if (!token && !tokenId) {
            return null;
        }

        deliveryStore.getTokenInfo(tokenId, (r) => {
            if (match && match.params && match.params.tracking_code) {
                deliveryStore.getDelivery(match.params.tracking_code, (res => {
                    if (res.data && res.data.shipment && res.data.shipment.dropoff_address) {
                        const {shipment} = res.data;
                        this.setState({
                            viewport: {
                                ...this.state.viewport,
                                latitude: shipment.dropoff_address.lat,
                                longitude: shipment.dropoff_address.lng,
                            }
                        });

                        // get customer edited data
                        deliveryStore.getEditedDeliveryData(res => {
                            const editedDelivery = res.data;
                            if (editedDelivery && editedDelivery.dropoff_latitude && editedDelivery.dropoff_longitude) {
                                this.setState({
                                    viewport: {
                                        ...this.state.viewport,
                                        latitude: editedDelivery.dropoff_latitude,
                                        longitude: editedDelivery.dropoff_longitude,
                                    }
                                })
                            }
                        });

                        // get addon services
                        deliveryStore.getAddonServices();
                        deliveryStore.markManageDeliveryOpened();
                    }
                }));
                deliveryStore.getSettings(match.params.tracking_code);
            }
        });
    }

    exitSession() {
        const {store, history} = this.props;

        store.deliveryStore.exitSession(
          () => history.push(`/${store.deliveryStore.trackingCode}/`)
        );
    }

    isAddonEnable = (addon) => {
        const {store} = this.props;
        const {addonServices} = store.deliveryStore;

        if (_.isEmpty(addonServices)) return false;

        const addonService = _.find(addonServices, {type: addon});

        if (!addonService) return false;

        return addonService.enabled;
    };

    renderMarker = (location) => {
        return new IconLayer({
            id: 'shipment-marker',
            data: [{
                location: [location.lng, location.lat],
                size: 40,
                icon: 'green',
            }],
            pickable: true,
            iconAtlas: MARKERS,
            iconMapping: {"green": {x: 0, y: 0, width: 168, height: 224, anchorY: 224}},
            getIcon: d => d.icon,
            sizeScale: 1,
            opacity: 1,
            visible: true,
            billboard: false,
            getPosition: d => d.location,
            getSize: d => d.size,
        });
    };

    renderDialog(view) {
        switch (view) {
            case 'window':
                return <EditWindowDialog />;
            case 'address':
                return <EditAddressDialog />;
            case 'note':
                return <EditInstructionDialog />;
            case 'map':
                return <EditLocationDialog />;
            case 'signature':
                return <EditSignatureOptionDialog />;
            default:
                return null;
        }
    }

    gotoSign = (e) => {
        const {history, match} = this.props;
        this.props.history.push("/" + match.params.tracking_code + "/signature");
    }

    render() {
        const {classes, store, history, mediaQuery, match} = this.props;
        const {showNotice, viewport, mapStyle} = this.state;
        const {deliveryStore} = store;
        const {
            delivery, settings, token, tokenRemainingTime, tokenRemainingTimeString, exitSessionDialog,
            editDialogOpened, dialogLoading, dialogErrorMsg, editedDeliveryData, loadingDelivery, hideCompanyBranding
        } = deliveryStore;

        if (!token) {
            return (
              <Container maxWidth="lg" className={classes.container}>
                  <Box style={{textAlign: 'center'}} p={5}>
                      <Box py={3}>No token found! Please redeem new one.</Box>
                      <Button variant="contained" color="primary"
                              className={clsx(classes.button, classes.dialogButton)}
                              style={{margin: 'auto'}}
                              onClick={() => history.push(`/${match.params.tracking_code}/`)}
                      >
                          OK
                      </Button>
                  </Box>
              </Container>
            );
        }

        if (loadingDelivery) {
            return (
              <Container maxWidth="lg" className={classes.container}>
                  <Grid style={{height: 300}} container alignItems="center" justify="center">
                      <CircularProgress color="primary" />
                  </Grid>
              </Container>
            )
        }

        if (!delivery) return null;

        const {client, shipment, outbound_events, signRequired} = delivery;
        const location = (editedDeliveryData.dropoff_latitude && editedDeliveryData.dropoff_longitude)
          ? {lat: editedDeliveryData.dropoff_latitude, lng: editedDeliveryData.dropoff_longitude}
          : shipment.dropoff_address;
        const layers = [this.renderMarker(location)];
        const translatedEvents = translateEvents(outbound_events || [], shipment);
        const milestones = translatedEvents.filter(e => VERBIAGE[e.convertedSignal]).map(e => VERBIAGE[e.convertedSignal].milestone);
        const milestone = milestones[0] || SHIPMENT_STATUS.PROCESSING;
        const deliveryTimeAndLabel = renderDeliveryTimeAndLabel(milestone, translatedEvents, shipment, settings);
        const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
        const fromTime = moment(shipment.dropoff_earliest_ts).tz(timezone).format('hh:mm A');
        const toTime = moment(shipment.dropoff_latest_ts).tz(timezone).format('hh:mm A');

        // Get edited data
        const editedFromTs = deliveryStore.getEditedDeliveryField('dropoff_earliest_ts');
        const editedFromTime = moment(editedFromTs).tz(timezone).format('hh:mm A');
        const editedToTs = deliveryStore.getEditedDeliveryField('dropoff_latest_ts');
        const editedToTime = moment(editedToTs).tz(timezone).format('hh:mm A');

        return (
          <Container maxWidth={false} disableGutters className={classes.container}>
              <Container className={classes.bodyContainer}>
                  <Box mb={3} className={classes.boxWrapper}>
                      <Box py={3} px={mediaQuery.isMobile ? 2 : 4} className={classes.sessionHeader}>
                          <Typography className={clsx(classes.marginBottom, classes.sessionHeaderTitle)} variant="h3">Manage Your Delivery</Typography>
                          <Typography className={classes.marginBottom}>You have just entered a session to edit Delivery Details, please complete your request before the session time!</Typography>
                          <Grid container justify="space-between">
                              <Grid item className={classes.selfCenter} style={{fontSize: mediaQuery.isMobile ? 13 : undefined}}>
                                  <span className={clsx(classes.bolded, classes.underlined)}>Session time:</span>
                                  <span className={classes.countdownTimer}>{tokenRemainingTimeString}</span>
                              </Grid>
                              <Grid item>
                                  <Button onClick={() => deliveryStore.openExitSessionDialog()} variant="outlined" color="secondary" className={classes.button}>
                                      Exit session
                                  </Button>
                              </Grid>
                          </Grid>
                      </Box>
                      <Box px={mediaQuery.isMobile ? 2 : 4} className={classes.sessionBody}>
                          <Box py={3} className={classes.shipmentDetails}>
                              <Box display="flex" justifyContent="space-between">
                                <Box><Typography variant="h5" className={clsx(classes.sessionBodyTitle, classes.marginBottom)}>Current Shipment Details</Typography></Box>
                              </Box>

                              <Box my={mediaQuery.isMobile ? 2 : 5}>
                                  <Grid container className={classes.shipmentDetailsContent}>
                                      <Grid item xs={12} sm={4}>
                                          <Grid container>
                                               {!hideCompanyBranding && (
                                              <Grid item>
                                                  <Avatar alt="Client Logo"
                                                          src={client.logo_url}
                                                          variant="square"
                                                          className={classes.clientLogo}
                                                  />

                                              </Grid>
                                              )}
                                              <Grid item className={classes.selfCenter} style={{marginLeft: 5}}>
                                                  {!hideCompanyBranding && (
                                                  <Typography className={classes.bolded}>{client.company}</Typography>
                                                  )}
                                              </Grid>
                                          </Grid>
                                      </Grid>
                                      <Grid item xs={12} sm={4}>
                                          <Typography className={classes.grayText}>Status:</Typography>
                                          <Typography className={clsx({
                                              [classes.bolded]: true,
                                              [classes.redColor]: milestone === SHIPMENT_STATUS.FAILED,
                                          })}>
                                              {milestone}
                                          </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={4}>
                                          <Typography className={classes.grayText}>{deliveryTimeAndLabel.label}</Typography>
                                          <Typography className={classes.bolded}>{deliveryTimeAndLabel.time}</Typography>
                                      </Grid>
                                  </Grid>
                              </Box>
                          </Box>
                          <Box py={3}>
                              <Typography variant="h5" className={clsx(classes.sessionBodyTitle, classes.marginBottom)}>Current Delivery Details</Typography>
                              <Typography className={classes.noticeText}>{EDIT_NOTICE}</Typography>
                              <Grid container style={{margin: '30px auto'}}>
                                  <Grid item xs={12} sm={6}>
                                      <Grid container direction="column">
                                       {settings && (settings.enable_signature_opt_out === "true") && <Grid item className={classes.editItem}>
                                            <Grid container spacing={2} justify="space-between">
                                                <Grid item className={classes.selfCenter}>
                                                    <Typography className={classes.editItemHeader}>Signature Option:</Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Button className={classes.button}
                                                            onClick={() => store.deliveryStore.openEditDialog('signature')}
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            <Box py={2} display="flex" justifyContent="space-between">
                                                <Box>
                                                    <strong>{(editedDeliveryData.signature_required !== undefined ? editedDeliveryData.signature_required : shipment.signature_required) ? 'No-Touch delivery' : 'Not Required'}</strong>
                                                </Box>
                                                {delivery.signRequired && (settings.enable_sign_in_manage_delivery === 'true') && <Box>
                                                    <Button className={classes.button}
                                                            onClick={this.gotoSign}
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                    >
                                                        Sign
                                                    </Button>
                                                </Box>}
                                            </Box>
                                          </Grid>}
                                          <Grid item className={classes.editItem}>
                                              <Grid container spacing={2} justify="space-between">
                                                  <Grid item className={classes.selfCenter}>
                                                      <Typography className={classes.editItemHeader}>Delivery window:</Typography>
                                                  </Grid>
                                                  <Grid item>
                                                      {this.isAddonEnable("customized_delivery_time") && (
                                                        <Button className={classes.button}
                                                                onClick={() => store.deliveryStore.openEditDialog('window')}
                                                                variant="outlined"
                                                                color="primary"
                                                                size="small"
                                                        >
                                                            Edit
                                                        </Button>
                                                      )}
                                                  </Grid>
                                              </Grid>
                                              <Grid container spacing={2} alignItems="center">
                                                  <Grid item xs={3}>
                                                      <Box className={classes.deliveryWindowLabel}>Scheduled:</Box>
                                                  </Grid>
                                                  <Grid item xs={9}>
                                                      {(!editedFromTs || !editedToTs)
                                                        ? <strong>{fromTime || 'N/A'} - {toTime || 'N/A'}</strong>
                                                        : `${fromTime || 'N/A'} - ${toTime || 'N/A'}`
                                                      }
                                                  </Grid>
                                                  <Grid item xs={3}>
                                                      <Box className={classes.deliveryWindowLabel}>Preferred:</Box>
                                                  </Grid>
                                                  <Grid item xs={9}>
                                                      {(!editedFromTs || !editedToTs) ? 'N/A' : <strong>{editedFromTime} - {editedToTime}</strong>}
                                                  </Grid>
                                              </Grid>
                                          </Grid>
                                          <Grid item className={classes.editItem}>
                                              <Grid container spacing={2} justify="space-between">
                                                  <Grid item className={classes.selfCenter}>
                                                      <Typography className={classes.editItemHeader}>Address:</Typography>
                                                  </Grid>
                                                  <Grid item>
                                                      <Button className={classes.button}
                                                              onClick={() => store.deliveryStore.openEditDialog('address')}
                                                              variant="outlined"
                                                              color="primary"
                                                              size="small"
                                                      >
                                                          Edit
                                                      </Button>
                                                  </Grid>
                                              </Grid>
                                              <Box py={1}>{shipment.dropoff_address.street}</Box>
                                              <Box py={1}>
                                                  <strong>{editedDeliveryData.street2 || shipment.dropoff_address.street2 || 'N/A'}</strong></Box>
                                              <Box py={1}>{shipment.dropoff_address.city}, {shipment.dropoff_address.state.toUpperCase()}, {shipment.dropoff_address.zipcode}</Box>
                                          </Grid>
                                          <Grid item className={classes.editItem}>
                                              <Grid container spacing={2} justify="space-between">
                                                  <Grid item className={classes.selfCenter}>
                                                      <Typography className={classes.editItemHeader}>Delivery Instructions:</Typography>
                                                  </Grid>
                                                  <Grid item>
                                                      <Button className={classes.button}
                                                              onClick={() => store.deliveryStore.openEditDialog('note')}
                                                              variant="outlined"
                                                              color="primary"
                                                              size="small"
                                                      >
                                                          Edit
                                                      </Button>
                                                  </Grid>
                                              </Grid>
                                              <Box py={2}>
                                                  <Box><strong>{editedDeliveryData.delivery_instruction || shipment.dropoff_additional_instruction || 'N/A'}</strong></Box>
                                                  {(editedDeliveryData.access_code || shipment.dropoff_access_code) && (
                                                    <Box py={2} className={classes.editItemHeader}>
                                                        <span>Access code: </span>
                                                        <strong>{editedDeliveryData.access_code || shipment.dropoff_access_code || 'N/A'}</strong>
                                                    </Box>
                                                  )}
                                              </Box>
                                          </Grid>
                                      </Grid>
                                  </Grid>
                                  <Grid item xs={12} sm={6} className={classes.locationMapWrapper}>
                                      <Box p={3} className={classes.mapEdit}>
                                          <Grid container spacing={2} justify="space-between">
                                              <Grid item className={classes.selfCenter}>
                                                  <Typography className={classes.editItemHeader}>Location Pin:</Typography>
                                              </Grid>
                                              <Grid item>
                                                  <Button className={classes.button}
                                                          onClick={() => store.deliveryStore.openEditDialog('map')}
                                                          variant="outlined"
                                                          color="primary"
                                                          size="small"
                                                  >
                                                      Edit
                                                  </Button>
                                              </Grid>
                                          </Grid>
                                          <Box className={classes.locationMap} mt={2.5}>
                                              <ReactMapGL
                                                {...viewport}
                                                mapStyle={mapStyle}
                                                transitionInterpolator={new LinearInterpolator()}
                                                onViewportChange={(viewport) => null}
                                                width="100%"
                                                height="100%"
                                              >
                                                  <DeckGL layers={layers}
                                                          viewState={viewport}
                                                  />
                                              </ReactMapGL>
                                          </Box>
                                      </Box>
                                  </Grid>
                              </Grid>
                          </Box>
                      </Box>
                  </Box>
                  <Dialog open={editDialogOpened}
                          onClose={() => store.deliveryStore.closeEditDialog()}
                          PaperProps={{style: {padding: '16px 0'}, className: classes.dialogPaper}}
                          maxWidth="md"
                          className={classes.container}
                  >
                      {this.renderDialog(editDialogOpened)}
                      {dialogLoading && <Box className={classes.dialogOverlay}>
                          <CircularProgress className={classes.dialogOverlayProgress} color="primary" />
                      </Box>}
                      {dialogErrorMsg && <Box py={1} px={3}>
                          <Typography align="center" className={classes.redColor}>{dialogErrorMsg}</Typography>
                      </Box>}
                  </Dialog>
                  <Dialog open={showNotice}
                          onClose={() => this.setState({showNotice: false})}
                          PaperProps={{style: {padding: '24px 0', textAlign: 'center'}, className: clsx(classes.container, classes.dialogPaper)}}
                          maxWidth="lg"
                          className={classes.container}
                  >
                      <DialogTitle className={classes.dialogTitle}>
                          <strong>Your session will end soon!</strong>
                      </DialogTitle>
                      <DialogContent>
                          <Typography className={clsx(classes.darkGrayText, classes.dialogBodyText)}>Please make your requests within the session time before it runs out.</Typography>
                      </DialogContent>
                      <DialogActions className={classes.dialogActionsWrapper} style={{justifyContent: 'center'}}>
                          <Button onClick={() => this.setState({showNotice: false})} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
                              GOT IT
                          </Button>
                      </DialogActions>
                  </Dialog>
                  <Dialog open={exitSessionDialog || !tokenRemainingTime}
                          onClose={() => deliveryStore.closeExitSessionDialog()}
                          PaperProps={{style: {padding: '24px 0', textAlign: 'center'}, className: clsx(classes.container, classes.dialogPaper)}}
                          disableEscapeKeyDown={!tokenRemainingTime}
                          disableBackdropClick={!tokenRemainingTime}
                          maxWidth="sm"
                          className={classes.container}
                  >
                      <DialogTitle className={classes.dialogTitle}>
                          <strong>
                              {!tokenRemainingTime ? 'Your token has expired!' : 'Manage Delivery Exit Confirmation'}
                          </strong>
                      </DialogTitle>
                      <DialogContent>
                          <Typography className={clsx(classes.darkGrayText, classes.dialogBodyText)}>
                              You will need to go through verification again to start another Manage Delivery session.
                              {!!tokenRemainingTime && ' Please confirm if you want to exit this current session!'}
                          </Typography>
                      </DialogContent>
                      <DialogActions className={classes.dialogActionsWrapper} style={{justifyContent: 'center'}}>
                          {!!tokenRemainingTime && (
                            <Button onClick={() => deliveryStore.closeExitSessionDialog()} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)}>
                                CANCEL
                            </Button>
                          )}
                          <Button onClick={() => this.exitSession()} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
                              EXIT
                          </Button>
                      </DialogActions>
                  </Dialog>
              </Container>
              {(!settings || !settings.hide_footer || settings.hide_footer === 'false') && (
                <FooterContainer client={client} shipment={shipment} settings={settings} />
              )}
              <Switch>
                    <Route path="/:tracking_code/edit/signature" component={SignatureContainer} />
              </Switch>
          </Container>
        )
    }
}

const EditShipmentCompose = compose(
    inject("store"),
    observer
  ) (EditShipmentContainer);

export default withStyles(styles)(withRouter(withMediaQuery()(EditShipmentCompose)));
