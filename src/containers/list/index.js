import React, {Component} from 'react';
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {Avatar, Box, Button, Chip, CircularProgress, Container, Grid, Typography, withStyles} from "@material-ui/core";
import styles from "../main/styles";
import withMediaQuery from "../../constants/mediaQuery";
import _ from "lodash";
import {renderDeliveryTimeAndLabel, translateEvents} from "../../utils/events";
import * as SHIPMENT_STATUS from "../../constants/shipmentStatus";
import clsx from "clsx";
import {Check as CheckIcon, Close as CloseIcon} from "@material-ui/icons";
import moment from "moment";
import {isoToLocalHuman} from "../../utils/calendar";
import TrackingMap from "../../components/TrackingMap";

class ListContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {store, match} = this.props;
    const {deliveryStore} = store;

    if (match && match.params && match.params.tracking_codes && !_.includes(['404', 'error'], match.params.tracking_codes)) {
      const {tracking_codes} = match.params;
      const trackingList = tracking_codes.split(',').map(code => code.trim()).filter(code => !!code);
      deliveryStore.listDeliveries(trackingList, res => {
        console.log(res.status);
        // 404 not found
        if(res.status === 404 || !res.data || !res.data.length) {
          if(_.includes(match.url, '/noredirect/')) {
            window.location.href = `/404`;
          } else {
            window.location.href = `/`;
          }
        }
      });
    }
  }

  render() {
    const {store, classes, mediaQuery, hideCompanyBranding} = this.props;
    const {deliveryStore} = store;
    const {deliveries, loadingDelivery} = deliveryStore;
    const {pageTheme} = deliveryStore;
    if (loadingDelivery) {
      return (
        <Container maxWidth="lg" className={classes.container}>
          <Grid style={{height: 300}} container alignItems="center" justify="center">
            <CircularProgress color="primary" />
          </Grid>
        </Container>
      )
    }

    return (
      <Box>
        {deliveries.map(delivery => {
          if (!delivery) return null;

          const {client, driver, settings, shipment, outbound_events, pickup, dropoff} = delivery;
          const translatedEvents = translateEvents(outbound_events || [], shipment);
          const milestones = outbound_events.map(e => e.milestone).filter(m => m);// translatedEvents.filter(e => VERBIAGE[e.convertedSignal]).map(e => VERBIAGE[e.convertedSignal].milestone);
          const milestone = milestones[0] || SHIPMENT_STATUS.PROCESSING;
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
          const deliveryTimeAndLabel = renderDeliveryTimeAndLabel(milestone, translatedEvents, shipment);
          let etaInTime = '';
          const inProgress = pickup && pickup.status === 'SUCCEEDED'
          if (dropoff && dropoff.status === 'SUCCEEDED') {
            etaInTime = "Delivered"
          } else if (dropoff && (dropoff.status === 'FAILED' || dropoff.status === 'DISCARDED')) {
            etaInTime = "-"
          } else if (SHIPMENT_STATUS.FAILED === milestone) {
            etaInTime = "-"
          } else if (inProgress && dropoff.estimated_arrival_ts) {
            const eta = moment(dropoff.estimated_arrival_ts).diff(moment.now())
            if (eta < 0) {
              etaInTime = "-"
            } else {
              const etaInSeconds = Math.ceil(eta / 1000)
              const etaInMinutes = Math.ceil(etaInSeconds/60);
              const roundUp = Math.max(0, Math.floor((etaInMinutes + 4) / 5) * 5)
              const minutes = roundUp % 60;
              const hours = Math.floor(roundUp / 60);
              etaInTime = 'about ' + `${hours > 0 ? `${hours}h ` : ''}` + minutes + 'm';
            }
          } else {
            etaInTime = 'by ' + isoToLocalHuman(shipment.dropoff_latest_ts, shipment.timezone || 'America/Los_Angeles', shipment.dropoff_latest_ts, "hA MM/DD/YYYY");
             if ( settings.hide_delivery_datetime === 'true'  && (SHIPMENT_STATUS.PROCESSING === milestone || SHIPMENT_STATUS.PROCESSED === milestone)){
                etaInTime = "N/A";
             }
          }

          return (
            <Container key={shipment.id} maxWidth={false} disableGutters className={classes.container}>
              <Container className={classes.bodyContainer}>
                <Box mb={mediaQuery.isMobile ? 2 : 3} className={classes.boxWrapper}>
                  <Box p={mediaQuery.isMobile ? 2 : 4.5} pb={mediaQuery.isMobile ? 3 : undefined} className={classes.statusContainer} borderRadius='10px 10px 0 0'>
                    <Box mb={2.5} className={classes.statusTitle}>
                      <Box>
                        <span className={classes.statusText}>Status: </span>
                        <span className={classes.statusTextBig}>{milestone}</span>
                      </Box>
                      <Box>
                        {shipment.attempt_count > 1 && <Chip size="small" className={classes.reattemptButton} label={'2nd attempt'} />}
                      </Box>
                    </Box>
                    <Box className={classes.statusProgress} borderRadius={'11px'}>
                      <Box className={clsx(classes.statusIndicator, classes.statusInProgress)}
                           style={progress[milestone]}
                      >
                        {[SHIPMENT_STATUS.FAILED, SHIPMENT_STATUS.CANCELLED, SHIPMENT_STATUS.UNDELIVERABLE_SH].indexOf(milestone) > -1
                          ? <CloseIcon className={classes.whiteIcon}/>
                          : <CheckIcon className={classes.whiteIcon}/>
                        }
                      </Box>
                    </Box>
                  </Box>
                  <Grid container className={classes.shipmentInfoContainer}>
                    <Grid item xs={12} sm={6} className={classes.shipmentInfoLeft}>
                      <Grid container wrap="nowrap" spacing={2} style={{marginBottom: 15}}>
                         {!hideCompanyBranding && (
                        <Grid item>
                          <Avatar alt="Client Logo"
                                  src={client.logo_url}
                                  variant="square"
                                  className={classes.clientLogo}
                          />
                        </Grid>
                        )}
                        <Grid item>
                         {!hideCompanyBranding && (
                          <Typography className={classes.clientName} variant="h4">{client.company}</Typography>
                          )}
                          <Box style={{fontSize: mediaQuery.isMobile ? 14 : 'inherit'}}>
                            <span className={classes.grayText}>Tracking code: </span>
                            <span className={classes.boldText}>{shipment.tracking_code}</span>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.shipmentInfoRight}>
                      <Box pl={mediaQuery.isMobile ? 8.25 : 0}>
                        <Box style={{marginBottom: 15}}>
                          <div className={classes.grayTextWithMarginBtm}>{deliveryTimeAndLabel.label}</div>
                          <div className={classes.boldText}>{deliveryTimeAndLabel.time}</div>
                        </Box>
                        <Box>
                          <div className={classes.grayTextWithMarginBtm}>Deliver to:</div>
                          <div className={classes.boldText}>{`${shipment.dropoff_address.city}, ${shipment.dropoff_address.state.toUpperCase()}, ${shipment.dropoff_address.zipcode}`}</div>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <Box mb={4}>
                  <Grid container spacing={mediaQuery.isMobile ? 0 : 2} className={classes.eventsAndMap}>
                    <Grid item xs={12} sm={6} className={classes.bodyItemWrapper}>
                      <Container className={clsx(classes.bodyBottomItem, classes.boxWrapper)}>
                        <Grid container justify="space-between">
                          <Grid item xs={7}>
                            <div className={classes.grayTextWithMarginBtm}>ETA</div>
                            <div className={classes.boldText}>{etaInTime}</div>
                          </Grid>
                          {settings.hide_delivery_vehicle_info !== 'true' && (
                            <Grid item xs={5} style={{textAlign: 'right'}}>
                              <div className={classes.grayTextWithMarginBtm}>Delivery Vehicle</div>
                              <div className={classes.boldText}>
                                {!!driver ? `${_.capitalize(driver.vehicle_make)} ${_.capitalize(driver.vehicle_model)}` : 'N/A'}
                              </div>
                            </Grid>
                           )}
                        </Grid>
                        {settings.tracking_show_map === 'true' && (
                          <Box height={mediaQuery.isMobile ? 250 : 500} mt={2.5}>
                            <TrackingMap shipment={shipment} />
                          </Box>
                        )}
                        {settings.tracking_show_map !== 'true' && mediaQuery.isMobile && (
                          <Box style={{marginTop: 35, height: 1, width: '100%', backgroundColor: '#ccc'}} />
                        )}
                      </Container>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.bodyItemWrapper}>
                      <Container className={clsx(classes.bodyBottomItem, classes.boxWrapper)}>
                        {translatedEvents.map((event, idx) => {
                          if (!event.description) return null;
                          const eventDate = moment(event.ts).tz(shipment.timezone || 'America/Los_Angeles').format('MMM DD');
                          const eventTime = moment(event.ts).tz(shipment.timezone || 'America/Los_Angeles').format('hh:mm A');
                          const mstone = event.milestone; // VERBIAGE[event.convertedSignal].milestone;

                          return (
                            <Grid key={idx} container className={classes.deliveryStep} alignItems="center">
                              <Grid item xs={3}
                                    className={clsx(classes.deliveryStepCell, classes.deliveryStepCellDateTime)}
                              >
                                <div className={classes.deliveryStepDate}>{eventDate}</div>
                                <div className={classes.deliveryStepTime}>{eventTime}</div>
                              </Grid>
                              <Grid item xs={1}
                                    className={clsx({
                                      [classes.deliveryStepCell]: true,
                                      [classes.deliveryStepCellIcon]: true,
                                      [classes.deliveryStepConnector]: idx + 1 < translatedEvents.length,
                                    })}
                              >
                                <Box className={clsx(classes.statusIndicator)}
                                     style={{backgroundColor: progress[mstone].backgroundColor}}
                                >
                                  {[SHIPMENT_STATUS.UNDELIVERABLE_SH, SHIPMENT_STATUS.FAILED, SHIPMENT_STATUS.CANCELLED].includes(mstone)
                                    ? <CloseIcon className={classes.whiteIcon} />
                                    : <CheckIcon className={classes.whiteIcon} />
                                  }
                                </Box>
                              </Grid>
                              <Grid item xs={9} className={classes.deliveryStepCell}>
                                <div>{event.description}</div>
                              </Grid>
                            </Grid>
                          )
                        })}
                      </Container>
                    </Grid>
                  </Grid>
                </Box>
              </Container>
            </Container>
          )
        })}
      </Box>
    );
  }
}

const ListContainerCompose = compose(
  inject("store"),
  observer
) (ListContainer);

export default withStyles(styles)(withMediaQuery()(ListContainerCompose));
