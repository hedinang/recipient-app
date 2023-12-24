import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import clsx from "clsx";

import {withStyles, Box, Button, Typography, DialogActions, DialogContent, DialogTitle, Grid, RadioGroup, FormControlLabel} from "@material-ui/core";

import styles from './styles';
import {compose} from "recompose";
import {EDIT_NOTICE} from "../../constants/verbiage";
import RadioButton from "../../components/RadioButton";
import moment from "moment";
import withMediaQuery from "../../constants/mediaQuery";

class EditWindowDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      earliest_time: '08:00AM',
      latest_time: '12:00PM',
      windowOptions: [
        {label: '08:00AM - 12:00PM', value: '08:00AM,12:00PM'},
        {label: '12:00PM - 04:00PM', value: '12:00PM,04:00PM'},
        {label: '04:00PM - 08:00PM', value: '04:00PM,08:00PM'},
      ],
    }
  }

  componentDidMount() {
    const {windowOptions} = this.state;
    const {deliveryStore} = this.props.store;
    const {delivery, editedDeliveryData} = deliveryStore;
    const {shipment} = delivery;

    const window = windowOptions[0].value.split(',');
    // Get edited data
    const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
    const editedFromTs = deliveryStore.getEditedDeliveryField('dropoff_earliest_ts');
    const editedFromTime = moment(editedFromTs).tz(timezone).format('hh:mmA');
    const editedToTs = deliveryStore.getEditedDeliveryField('dropoff_latest_ts');
    const editedToTime = moment(editedToTs).tz(timezone).format('hh:mmA');

    this.setState({
      earliest_time: editedFromTs ? editedFromTime : window[0],
      latest_time: editedToTs ? editedToTime : window[1],
    })
  }

  handleTimeWindowChange = (value) => {
    const window = value.split(',');
    this.setState({
      earliest_time: window[0],
      latest_time: window[1],
    });
  };

  save = () => {
    const {deliveryStore} = this.props.store;
    const {delivery} = deliveryStore;
    const {earliest_time, latest_time} = this.state;
    const {shipment} = delivery;
    const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
    const dropoffDate = moment(shipment.dropoff_earliest_ts).tz(timezone).format('DD/MM/YYYY');
    const earliest_ts = moment.tz(dropoffDate + ' ' + earliest_time, 'DD/MM/YYYY hh:mmA', timezone).toISOString();
    const latest_ts = moment.tz(dropoffDate + ' ' + latest_time, 'DD/MM/YYYY hh:mmA', timezone).toISOString();

    deliveryStore.setEditedDeliveryField('dropoff_earliest_ts', earliest_ts);
    deliveryStore.setEditedDeliveryField('dropoff_latest_ts', latest_ts);

    deliveryStore.saveAndCloseDialog();
  };

  render() {
    const {windowOptions} = this.state;
    const {classes, store, mediaQuery} = this.props;
    const {deliveryStore} = store;
    const {delivery, tokenRemainingTimeString, editedDeliveryData} = deliveryStore;

    if (!delivery) return null;

    const {shipment} = delivery;
    const window = windowOptions[0].value.split(',');
    const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
    const fromTime = moment(shipment.dropoff_earliest_ts).tz(timezone).format('hh:mm A');
    const toTime = moment(shipment.dropoff_latest_ts).tz(timezone).format('hh:mm A');

    // Get edited data
    const editedFromTs = deliveryStore.getEditedDeliveryField('dropoff_earliest_ts');
    const editedFromTime = moment(editedFromTs).tz(timezone).format('hh:mmA');
    const editedToTs = deliveryStore.getEditedDeliveryField('dropoff_latest_ts');
    const editedToTime = moment(editedToTs).tz(timezone).format('hh:mmA');
    const savedWindowValue = (editedFromTs && editedToTs) ? editedFromTime + ',' + editedToTime : window[0] + ',' + window[1];

    return (
      <Box className={classes.container}>
        <DialogTitle disableTypography className={classes.titleBox}>
          <Grid container justify="space-between"
                alignItems={mediaQuery.isMobile ? 'flex-start' : 'center'}
                direction={mediaQuery.isMobile ? 'column' : 'row'}
                spacing={mediaQuery.isMobile ? 1 : 0}
          >
            <Grid item className={classes.dialogTitle}>
              <strong>Edit Delivery Window</strong>
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
          <Box pt={1}>
            <Typography className={clsx(classes.darkGrayText, classes.infoBox)}>
              Please make final changes 24 hours before noon of the Scheduled Delivery Date
            </Typography>
            <Box py={3}>
              <Typography className={classes.marginBottom}><strong>Scheduled Delivery Window</strong></Typography>
              <Typography className={classes.darkGrayText}><span>{fromTime} - {toTime}</span></Typography>
            </Box>
            <Box py={1}>
              <Typography className={classes.marginBottom}><strong>Preferred Delivery Window</strong></Typography>
              <RadioGroup name="preferred_window" defaultValue={savedWindowValue || windowOptions[0].value}>
                {windowOptions.map(wd => (
                  <FormControlLabel
                    control={<RadioButton/>}
                    label={<span className={classes.darkGrayText} style={{verticalAlign: 'sub'}}>{wd.label}</span>}
                    value={wd.value}
                    onChange={e => this.handleTimeWindowChange(e.target.value)}
                  />
                ))}
              </RadioGroup>
            </Box>
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

const EditWindowDialogCompose = compose(
  inject("store"),
  observer
) (EditWindowDialog);

export default withStyles(styles)(withMediaQuery()(EditWindowDialogCompose));