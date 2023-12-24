import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import clsx from "clsx";

import {
  withStyles,
  Box,
  Button,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField
} from "@material-ui/core";

import styles from './styles';
import {compose} from "recompose";
import {EDIT_NOTICE} from "../../constants/verbiage";
import withMediaQuery from "../../constants/mediaQuery";

class EditAddressDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      street2: '',
    }
  }

  componentDidMount() {
    const {delivery, editedDeliveryData} = this.props.store.deliveryStore;
    const {shipment} = delivery;

    this.setState({street2: editedDeliveryData.street2 || shipment.dropoff_address.street2});
  }

  handleInputChange = (value) => {
    this.setState({street2: value});
  };

  save = () => {
    const {deliveryStore} = this.props.store;
    const {street2} = this.state;

    deliveryStore.setEditedDeliveryField('street2', street2);
    deliveryStore.saveAndCloseDialog();
  };

  render() {
    const {classes, store, mediaQuery} = this.props;
    const {deliveryStore} = store;
    const {delivery, tokenRemainingTimeString, editedDeliveryData} = deliveryStore;

    if (!delivery) return null;

    const {shipment} = delivery;
    const {dropoff_address} = shipment;

    return (
      <Box className={classes.container}>
        <DialogTitle disableTypography className={classes.titleBox}>
          <Grid container justify="space-between"
                alignItems={mediaQuery.isMobile ? 'flex-start' : 'center'}
                direction={mediaQuery.isMobile ? 'column' : 'row'}
                spacing={mediaQuery.isMobile ? 1 : 0}
          >
            <Grid item className={classes.dialogTitle}>
              <strong>Edit Address</strong>
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
          <Box pb={3}>
            <Box pt={1} pb={3}>
              <Typography className={clsx(classes.darkGrayText, classes.infoBox)}>
                We can only assist you to change Address Line 2 online. To change full address, please contact our Dispatch Team at <strong style={{color: '#666'}}>(855)-249-SHIP</strong>
              </Typography>
            </Box>
            <Grid container alignItems="center" spacing={mediaQuery.isMobile ? 2 : 4} className={classes.addressEdit}>
              <Grid item xs={12} sm={2} className={classes.darkGrayText}>Address 1</Grid>
              <Grid item xs={12} sm={10}>{dropoff_address.street}</Grid>

              <Grid item xs={12} sm={2} className={classes.darkGrayText}>Address 2</Grid>
              <Grid item xs={12} sm={10} className={classes.addressInputWrapper}>
                <TextField variant="outlined"
                           margin="dense"
                           size="medium"
                           className={classes.addressInput}
                           defaultValue={editedDeliveryData.street2 || dropoff_address.street2}
                           onChange={(e) => this.handleInputChange(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={2} className={classes.darkGrayText}>City</Grid>
              <Grid item xs={12} sm={10}>{dropoff_address.city}</Grid>

              <Grid item xs={12} sm={2} className={classes.darkGrayText}>State</Grid>
              <Grid item xs={12} sm={10}>{dropoff_address.state}</Grid>

              <Grid item xs={12} sm={2} className={classes.darkGrayText}>Zipcode</Grid>
              <Grid item xs={12} sm={10}>{dropoff_address.zipcode}</Grid>
            </Grid>
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

const EditAddressDialogCompose = compose(
  inject("store"),
  observer
) (EditAddressDialog);

export default withStyles(styles)(withMediaQuery()(EditAddressDialogCompose));