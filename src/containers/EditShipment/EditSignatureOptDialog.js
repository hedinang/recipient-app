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

import ButtonSelectBox from '../../components/ButtonSelectBox';

class EditSignatureOptionDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signature_required: false
    }
  }

  componentDidMount() {
    const {delivery, editedDeliveryData} = this.props.store.deliveryStore;
    const {shipment} = delivery;

    this.setState({
      signature_required: editedDeliveryData.signature_required || shipment.signature_required,      
    });
  }

  onChange = (value) => {
    this.setState({'signature_required': value});
  };

  save = () => {
    const {deliveryStore} = this.props.store;
    const {signature_required} = this.state;

    deliveryStore.setEditedDeliveryField('signature_required', signature_required);    
    deliveryStore.saveAndCloseDialog();
  };

  render() {
    const {classes, store, mediaQuery} = this.props;
    const {deliveryStore} = store;
    const {delivery, tokenRemainingTimeString, editedDeliveryData} = deliveryStore;

    if (!delivery) return null;

    const {shipment} = delivery;

    const options = [
      {label: 'No-Touch Delivery', value: true},
      {label: 'Not Required', value: false}
    ];

    return (
      <Box className={classes.container}>
        <DialogTitle disableTypography>
          <Grid container justify="space-between"
                alignItems={mediaQuery.isMobile ? 'flex-start' : 'center'}
                direction={mediaQuery.isMobile ? 'column' : 'row'}
                spacing={mediaQuery.isMobile ? 1 : 0}
          >
            <Grid item className={classes.dialogTitle}>
              <strong>Signature Option</strong>
            </Grid>
            <Grid item className={classes.dialogTimer}>
              <span className={classes.underlined}>Session time:</span>
              <span className={classes.timerCounter}>{tokenRemainingTimeString}</span>
            </Grid>
          </Grid>
          <Box pt={2} pb={mediaQuery.isMobile ? 1 : 3} className={classes.noticeSignatureBox}>
            - To have your signature collected remotely on 
            your device, choose <strong>“No-touch Delivery”</strong>.<br/>
            - To opt-out your signature and have the delivery left at the door, choose <strong>“Not Required”</strong>.
          </Box>
        </DialogTitle>
        <DialogContent>
          <ButtonSelectBox value={this.state.signature_required} onChange={this.onChange} options={options} title='Signature Option:' />          
        </DialogContent>
        <DialogActions className={classes.dialogActionsWrapper}>
          <Button onClick={() => deliveryStore.closeEditDialog()} className={clsx(classes.button, classes.dialogButton)}>
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

const EditSignatureOptionDialogCompose = compose(
  inject("store"),
  observer
) (EditSignatureOptionDialog);

export default withStyles(styles)(withMediaQuery()(EditSignatureOptionDialogCompose));