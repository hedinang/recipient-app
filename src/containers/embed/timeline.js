import React, {Component} from 'react';
import {Box, Container, Grid, withStyles} from "@material-ui/core";
import {Check as CheckIcon, Close as CloseIcon} from "@material-ui/icons";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import clsx from "clsx";
import moment from "moment";

// Internal
import styles from "../main/styles";
import withMediaQuery from "../../constants/mediaQuery";
import * as SHIPMENT_STATUS from "../../constants/shipmentStatus";
import {translateEvents} from "../../utils/events";

class Timeline extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {store, match} = this.props;
    const {deliveryStore} = store;
    if (match && match.params && match.params.tracking_code) {
      deliveryStore.getDelivery(match.params.tracking_code, null);
    }
  }

  render() {
    const {classes, store} = this.props;
    const {delivery} = store.deliveryStore;
    const {pageTheme} = store.deliveryStore;
    if (!delivery) return null;

    const {shipment, outbound_events} = delivery;
    const translatedEvents = translateEvents(outbound_events || [], shipment);
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

    return (
      <Grid item xs={12} sm={6} className={classes.bodyItemWrapper}>
        <Container className={classes.bodyBottomItem}>
          {translatedEvents.map((event, idx) => {
            const text = event.description;

            if (!text) return null;

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
                  <div>{text}</div>
                </Grid>
              </Grid>
            )
          })}
        </Container>
      </Grid>
    )
  }
}

const TimelineCompose = compose(
  inject("store"),
  observer
) (Timeline);

export default withStyles(styles)(withMediaQuery()(TimelineCompose))
