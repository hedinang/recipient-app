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

class EditInstructionDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      instruction: '',
      access_code: '',
    }
  }

  componentDidMount() {
    const {delivery, editedDeliveryData} = this.props.store.deliveryStore;
    const {shipment} = delivery;

    this.setState({
      instruction: editedDeliveryData.delivery_instruction || shipment.dropoff_additional_instruction,
      access_code: editedDeliveryData.access_code || shipment.dropoff_access_code,
    });
  }

  handleInputChange = (field, value) => {
    this.setState({[field]: value});
  };

  save = () => {
    const {deliveryStore} = this.props.store;
    const {instruction, access_code} = this.state;

    deliveryStore.setEditedDeliveryField('delivery_instruction', instruction);
    deliveryStore.setEditedDeliveryField('access_code', access_code);
    deliveryStore.saveAndCloseDialog();
  };

  render() {
    const {classes, store, mediaQuery} = this.props;
    const {deliveryStore} = store;
    const {delivery, tokenRemainingTimeString, editedDeliveryData} = deliveryStore;

    if (!delivery) return null;

    const {shipment} = delivery;

    return (
      <Box className={classes.container}>
        <DialogTitle disableTypography className={classes.titleBox}>
          <Grid container justify="space-between"
                alignItems={mediaQuery.isMobile ? 'flex-start' : 'center'}
                direction={mediaQuery.isMobile ? 'column' : 'row'}
                spacing={mediaQuery.isMobile ? 1 : 0}
          >
            <Grid item className={classes.dialogTitle}>
              <strong>Edit Delivery Instructions</strong>
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
          <Box mb={3}>
            <Box pb={2} pt={1}><strong>Delivery Instructions:</strong></Box>
            <TextField placeholder="Tell us more about where should we leave the package or tips to find your address!"
                       fullWidth
                       multiline
                       rows={5}
                       variant="outlined"
                       inputProps={{className: classes.inputField}}
                       defaultValue={deliveryStore.getEditedDeliveryField('delivery_instruction') || shipment.dropoff_additional_instruction}
                       onChange={(e) => this.handleInputChange('instruction', e.target.value)}
            />
          </Box>
          <Box mb={3}>
            <Box py={2}><strong>Access code:</strong></Box>
            <TextField placeholder="e.g: #1234"
                       fullWidth
                       variant="outlined"
                       inputProps={{className: classes.inputField}}
                       defaultValue={deliveryStore.getEditedDeliveryField('access_code') || shipment.dropoff_access_code}
                       onChange={(e) => this.handleInputChange('access_code', e.target.value)}
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

const EditInstructionDialogCompose = compose(
  inject("store"),
  observer
) (EditInstructionDialog);

export default withStyles(styles)(withMediaQuery()(EditInstructionDialogCompose));