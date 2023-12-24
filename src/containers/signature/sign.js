import React, {Component} from 'react';
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {withStyles} from "@material-ui/core";

import { fade, makeStyles } from '@material-ui/core/styles';
import {CircularProgress, LinearProgress, DialogContentText, AppBar, Toolbar, IconButton, Badge, MenuItem, Button, Dialog, DialogContent, DialogActions, Box, Typography} from '@material-ui/core';
import {Menu as MenuIcon, AccountCircle, Mail as MailIcon, Notifications as NotificationsIcon} from '@material-ui/icons';

import styles from "./styles";
import clsx from 'clsx';
import withMediaQuery from "../../constants/mediaQuery";
import SignatureCanvas from 'react-signature-canvas';
import CloseIcon from '@material-ui/icons/Close';

class SignatureComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signed: false,
      changed: false,
    }
  }
  
  signature = null;

  clear = (e) => {
    if (this.signature) {
      this.signature.clear();
      this.setState({signed: false});
    }
  }

  resizeCanvas = () => {
    if (!this.signature) return;
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);
    const canvas = this.signature.getCanvas();

    if (!canvas) return;
  
    // This part causes the canvas to be cleared
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
  
    // This library does not listen for canvas changes, so after the canvas is automatically
    // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
    // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
    // that the state of this library is consistent with visual state of the canvas, you
    // have to clear it manually.
    this.signature.clear();
  }

  componentDidMount() {    
    window.addEventListener("orientationchange", this.resizeCanvas);
  }

  componentWillUnmount() {
    window.removeEventListener("orientationchange", this.resizeCanvas);
  }
  

  done = (e) => {
    const {store, onSign} = this.props;
    if (!this.state.signed) return;
    const trimmedCanvas = this.signature.getTrimmedCanvas();
    onSign(trimmedCanvas.toDataURL());     
  }

  onEnd = () => {
    this.setState({signed: true});
  }

  // lockScreenOrientation () {
  //   const lockOrientationUniversal = window.screen.lockOrientation || window.screen.mozLockOrientation || window.screen.msLockOrientation;
  //   console.log('lock is: ', window.screen);

  //   alert(lockOrientationUniversal)
  //   // if (window.screen.lockOrientationUniversal("landscape")) {
  //   //   // Orientation was locked
  //   // } else {
  //   //   // Orientation lock failed
  //   // }
  // }


  render() {
    const {mediaQuery, classes, store, onClose} = this.props;    

    // alert(window.screen.orientation.type);
    // if ("orientation" in window.screen) {
    //   window.screen.orientation.lock("landscape-primary");
    // } else {
    //   window.screen.lockOrientation("landscape-primary");
    // }

    // this.lockScreenOrientation("landscape");
    
    return <Dialog open={true}               
        maxWidth="md"
        fullScreen={true}
        fullWidth={true}
        disableBackdropClick
        disableEscapeKeyDown
        className={classes.container}
    >
    <DialogContentText className={classes.contentText}>
      <IconButton onClick={onClose} style={{position: 'absolute', top: 0, right: 0, color: '#BEBFC0', padding: '5px'}} >
        <CloseIcon />
      </IconButton>
      <Box paddingLeft={3}>
        <Typography>Please provide your signature in the box below</Typography>        
      </Box>
    </DialogContentText>        
      <DialogContent className={classes.mainContent}>
      <SignatureCanvas onEnd={this.onEnd} ref={(ref) => { this.signature = ref }} penColor='black'
        canvasProps={{className: classes.canvas}} />
        
      </DialogContent>
      <DialogActions className={classes.dialogActionsWrapper}>
          <Button onClick={this.clear} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)}>
            Clear
          </Button>
          <Button disabled={!this.state.signed} onClick={this.done} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
            Done
          </Button>
        </DialogActions>    
    </Dialog>
  }
}

const SignatureCompose = compose(
  inject("store"),
  observer
) (SignatureComponent);

export default withStyles(styles)(withMediaQuery()(SignatureCompose));