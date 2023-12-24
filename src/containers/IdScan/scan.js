import React, {Component} from 'react';
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {withStyles} from "@material-ui/core";

import { fade, makeStyles } from '@material-ui/core/styles';
import {CircularProgress, LinearProgress, DialogContentText, AppBar, Toolbar, IconButton, Badge, MenuItem, Button, Dialog, DialogContent, DialogActions, DialogTitle, Box, Typography} from '@material-ui/core';
import {Menu as MenuIcon, AccountCircle, Mail as MailIcon, Notifications as NotificationsIcon} from '@material-ui/icons';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import CameraPhoto, { FACING_MODES } from 'jslib-html5-camera-photo';
import '../../utils/fixBigInt';
import { BrowserPDF417Reader, BrowserQRCodeReader } from '@zxing/custom';

import styles from "./styles";
import clsx from 'clsx';
import withMediaQuery from "../../constants/mediaQuery";
import CloseIcon from '@material-ui/icons/Close';
import {getCookie} from "../../utils/cookie";
import moment from 'moment';


class ScanID extends Component {
  constructor(props) {
    super(props);
    this.cameraPhoto = null;
    this.videoRef = React.createRef();  
    this.codeReader = new BrowserPDF417Reader();      
    // this.codeReader = new BrowserQRCodeReader();      
    this.state = {
      dataUri: '', 
      alert: false,
      showCantscanDigalog: false     
    }
  }
  
  
  componentDidMount() {    
    const {store, location, match} = this.props;    
    const {deliveryStore} = store;

    // let token = location.search.replace("?token=", "");    
    // if (!token || token.trim() === '') {
    //   token = getCookie("axl_shipment_token");
    // }
    

    // console.log('match is: ', match);

    //store.deliveryStore.getSettings(match.params.tracking_code);
    // store.deliveryStore.isAllowScanId(match.params.tracking_code, token).then(resp => {            
    //   if (resp.ok) {
    //     if (!resp.data.allow_scan) {
    //       this.goBack()
    //     } else {
    //       this.setState({token, shipmentId: resp.data.shipment_id, settings: resp.data.settings});          
    //     }        
    //   } else {
    //     this.goBack();
    //   }
    // })

    this.cameraPhoto = new CameraPhoto(this.videoRef.current);    
    // this.startCameraMaxResolution(FACING_MODES.ENVIRONMENT, true);
    this.cameraPhoto.startCamera(FACING_MODES.ENVIRONMENT, {height: 1536, width: 450});

    this.scanOne();

    // var content = "@\n\u001e\rANSI 636014040002DL00410277ZC03180042DLDCAC\nDCB01\nDCDNONE\nDBA11092021\nDCSTRAN\nDACLONG\nDADHUNG\nDBD09282016\nDBB11091984\nDBC1\nDAYBLK\nDAU066 IN\nDAG3797 STONEGLEN NORTH 15\nDAIRICHMOND\nDAJCA\nDAK948060000  \nDAQF3566015\nDCF09/20/2012504RB/DDFD/21\nDCGUSA\nDDEU\nDDFU\nDDGU\nDAW130\nDAZBLK\nDCK16272F35660150401\nDDB04162010\nDDD0\n\rZCZCA\nZCBCORR LENS\nZCCBLK\nZCDBLK\nZCE\nZCF\n\r";
    // var data = this.parsePDFContent(content);

    // console.log('data is: ', data);
    // const isValidDOB = this.validateDOB(data['dob'], 21);


  }

  processIdData = (content) => {
    // this.startCameraMaxResolution(FACING_MODES.USER, false);

    const {store, location, match, onConfirmScan} = this.props;    
    const {deliveryStore} = store;
    const ageLimit = this.state.settings && this.state.settings.id_required_age_limit ? 
                      parseInt(this.state.settings.id_required_age_limit) : 21;

    // console.log("got content", content);
    var data = this.parsePDFContent(content);    
    const isValidDOB = this.validateDOB(data['dob'], ageLimit);

    if (!isValidDOB) {
      this.openAlert();
      // this.codeReader.stopStreams();
    } else {
      onConfirmScan(data);
      this.goBack();
    }
  }

  scanOne = (e) => {
    this.codeReader
      .decodeOnceFromVideoDevice(undefined, 'idvideo').then((result, error) => {        
        var content = result.text;
        // var content = "@\n\u001e\rANSI 636014040002DL00410277ZC03180042DLDCAC\nDCB01\nDCDNONE\nDBA11092021\nDCSTRAN\nDACLONG\nDADHUNG\nDBD09282016\nDBB11091984\nDBC1\nDAYBLK\nDAU066 IN\nDAG3797 STONEGLEN NORTH 15\nDAIRICHMOND\nDAJCA\nDAK948060000  \nDAQF3566015\nDCF09/20/2012504RB/DDFD/21\nDCGUSA\nDDEU\nDDFU\nDDGU\nDAW130\nDAZBLK\nDCK16272F35660150401\nDDB04162010\nDDD0\n\rZCZCA\nZCBCORR LENS\nZCCBLK\nZCDBLK\nZCE\nZCF\n\r";
        this.processIdData(content);
      })
      .catch((error) => {
        this.scanOne();
        console.error(error);
        // alert('error is: ', error);
      });

    this.closeAlert();  
  }

  scanContinue = (e) => {    
    const that = this;
    this.codeReader
      .decodeFromInputVideoDeviceContinuously(undefined, 'idvideo', (result, err) => {        
        if (result) {                    
          that.codeReader.stopStreams();
          this.cameraPhoto.stopCamera();
          // var content = "@\n\u001e\rANSI 636014040002DL00410277ZC03180042DLDCAC\nDCB01\nDCDNONE\nDBA11092021\nDCSTRAN\nDACLONG\nDADHUNG\nDBD09282016\nDBB11091984\nDBC1\nDAYBLK\nDAU066 IN\nDAG3797 STONEGLEN NORTH 15\nDAIRICHMOND\nDAJCA\nDAK948060000  \nDAQF3566015\nDCF09/20/2012504RB/DDFD/21\nDCGUSA\nDDEU\nDDFU\nDDGU\nDAW130\nDAZBLK\nDCK16272F35660150401\nDDB04162010\nDDD0\n\rZCZCA\nZCBCORR LENS\nZCCBLK\nZCDBLK\nZCE\nZCF\n\r";
          var content = result.text;
          this.processIdData(content);
        }   
        
        if (err) {
          console.log('error is: ', err);
        }
      })
      .catch((error) => {
        console.error(error);
        alert('error is: ', error);
      });

    this.closeAlert();  
  }

  reScan = () => {
    this.closeAlert();    
    // this.startCameraMaxResolution(FACING_MODES.ENVIRONMENT, true);
    this.scanOne()
  }

  goBack = () => {
    const {history, location} = this.props;    
    // this.cameraPhoto.stopCamera();
    history.replace(location.pathname.replace(/\/scan[^\.]*$/g, "?token=" + this.props.token));
  }

  gotoShipment = () => {
    const {history, location} = this.props;    
    history.replace(location.pathname.replace(/\/idscan\/scan[^\.]*$/g, ""));
  }

  componentWillUnmount() {
    this.codeReader.reset()
    if (this.cameraPhoto)
      this.cameraPhoto.stopCamera().then(() => {
        console.log('Camera stoped!');
      })
      .catch((error) => {
        console.log('No camera to stop!:', error);
      });
  }

  parsePDFContent = (content) => {    
    var lines = content.split("\n");
    const data = {content};

    if (lines && lines.length > 0) {
      lines.forEach(line => {
        if (line.startsWith("DBB")) {
          var dobString = line.substring(3);          
          var dob = new Date(dobString.substring(4), parseInt(dobString.substring(0, 2)) - 1, dobString.substring(2, 4));
          data['dob'] = dob;          
        }

        if (line.startsWith("DCS")) {
          data['last_name'] = line.substring(3);
        }
        if (line.startsWith("DAD") || line.startsWith("DBQ")) {
          data['middle_name'] = line.substring(3);
        }
        if (line.startsWith("DAC") || line.startsWith("DCT")) {
          data['first_name'] = line.substring(3);
        }
      })
    }

    return data;
  }

  validateDOB = (dob, ageLimit) => {
    var now = new Date();

    var age = now.getYear() - dob.getYear();

    if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
      age -= 1;      
    }

    if (age < ageLimit) {
      this.setState({dob, ageLimit});

      return false;
    }

    return true;
  }

  startCameraMaxResolution = (facingMode, doScan) => {
    this.cameraPhoto.startCameraMaxResolution(facingMode)
      .then(() => {
        console.log('camera is started bbb !');           
        // const codeReader = new BrowserPDF417Reader();
        console.log('doscan is: ', doScan);
        if (doScan) {
          // this.scanOne();
          this.scanOne();
          // this.codeReader
          //   .decodeOnceFromVideoDevice(undefined, 'idvideo').then((result, error) => {
          //     var content = "@\n\u001e\rANSI 636014040002DL00410277ZC03180042DLDCAC\nDCB01\nDCDNONE\nDBA11092021\nDCSTRAN\nDACLONG\nDADHUNG\nDBD09282016\nDBB11091984\nDBC1\nDAYBLK\nDAU066 IN\nDAG3797 STONEGLEN NORTH 15\nDAIRICHMOND\nDAJCA\nDAK948060000  \nDAQF3566015\nDCF09/20/2012504RB/DDFD/21\nDCGUSA\nDDEU\nDDFU\nDDGU\nDAW130\nDAZBLK\nDCK16272F35660150401\nDDB04162010\nDDD0\n\rZCZCA\nZCBCORR LENS\nZCCBLK\nZCDBLK\nZCE\nZCF\n\r";
          //     // var content = result.text;
          //     this.processIdData(content);
          //   })
          //   .catch((error) => {
          //     console.error('Camera not started!', error);
          //   });
          // this.codeReader
          //   .decodeOnceFromVideoDevice(undefined, 'idvideo', (result, error) => {
          //     var content = "@\n\u001e\rANSI 636014040002DL00410277ZC03180042DLDCAC\nDCB01\nDCDNONE\nDBA11092021\nDCSTRAN\nDACLONG\nDADHUNG\nDBD09282016\nDBB11091984\nDBC1\nDAYBLK\nDAU066 IN\nDAG3797 STONEGLEN NORTH 15\nDAIRICHMOND\nDAJCA\nDAK948060000  \nDAQF3566015\nDCF09/20/2012504RB/DDFD/21\nDCGUSA\nDDEU\nDDFU\nDDGU\nDAW130\nDAZBLK\nDCK16272F35660150401\nDDB04162010\nDDD0\n\rZCZCA\nZCBCORR LENS\nZCCBLK\nZCDBLK\nZCE\nZCF\n\r";
          //     // var content = result.text;
          //     this.processIdData(content);
          //   });
        }
        

          // codeReader.decodeFromInputVideoDeviceContinuously(undefined, 'idvideo', (result, err) => {
          //   if (result) {
          //     // properly decoded qr code
          //     console.log('Found QR code!', result)
          //     this.setState({result: result.text, raw: result})
          //   }
    
          //   if (err) {
          //     // As long as this error belongs into one of the following categories
          //     // the code reader is going to continue as excepted. Any other error
          //     // will stop the decoding loop.
          //     //
          //     // Excepted Exceptions:
          //     //
          //     //  - NotFoundException
          //     //  - ChecksumException
          //     //  - FormatException
          //     console.log('got error', err);

          //     this.setState({result: err.message});
    
          //     // if (err instanceof ZXing.NotFoundException) {
          //     //   alert('No QR code found.')
          //     // }
    
          //     // if (err instanceof ZXing.ChecksumException) {
          //     //   alert('A code was found, but it\'s read value was not valid.')
          //     // }
    
          //     // if (err instanceof ZXing.FormatException) {
          //     //   alert('A code was found, but it was in a invalid format.')
          //     // }
          //   }
          // })
      })
      .catch((error) => {
        console.error('Camera not started!', error);
      });
  }

  closeAlert = (e) => {
    this.setState({alert: false});
  }
  
  openAlert = (e) => {
    this.setState({alert: true});
  }

  closeCantscanModal = (e) => {
    this.setState({showCantscanDigalog: false});
  }
  
  openCantscanModal = (e) => {
    this.setState({showCantscanDigalog: true});
  }

  driverScan = (e) => {
    this.setState({showCantscanDigalog: false});
    this.gotoShipment()
  }

  render() {
    const {mediaQuery, classes, store, onClose} = this.props;    
    return (<div style={{position: 'relative', height: '100%'}}>    
      <Dialog
        open={this.state.alert}
        onClose={this.closeAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">ID Verification Failed</DialogTitle>
        <DialogContent>        
          <Typography>Date of birth: <strong>{moment(this.state.dob).format('MMM, D, YYYY')}</strong></Typography>
          <Typography><strong>Recipient must be of age {this.state.ageLimit} or older.</strong></Typography>          
        </DialogContent>
        <DialogActions>
          <Button onClick={this.goBack} color="primary">
            Close
          </Button>
          <Button onClick={this.reScan} color="primary" autoFocus>
            ReScan
          </Button>
        </DialogActions>
      </Dialog>  

      <Dialog
        open={this.state.showCantscanDigalog}
        onClose={this.closeAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Can't scan?</DialogTitle>
        <DialogContent>        
          <Typography>Please try to place your card on a flat surface and hold your phone steady with both hands.</Typography>          
          <Typography style={{color: '#878687', paddingTop: "10px", fontSize: '13px'}}>If the ID still cannot be scanned, our driver must  scan/verify your card in person.</Typography>
        </DialogContent>
        <Box marginTop={5} display="flex" justifyContent="center" width="100%">
            <Button onClick={this.closeCantscanModal} className={clsx(classes.button, classes.cantscanButton)} color="primary" style={{backgroundColor: '#6c62f5'}} variant="contained">Try scanning again</Button>  
        </Box>
        <Box marginTop={2} display="flex" justifyContent="center" width="100%">
            <Button onClick={this.driverScan} className={clsx(classes.button, classes.cantscanButton)} style={{backgroundColor: '#2a2444'}} variant="contained">Have driver collect</Button>  
        </Box>
      </Dialog>  

      <Box className={clsx(classes.scanTipWrapper)}>
        <IconButton onClick={this.goBack} variant="contained" style={{backgroundColor: '#888', color: '#fff'}} size="small" aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Box className={clsx(classes.scanTip)}>
          <Typography className={clsx(classes.scanTipTitle)}>Scan Identification Card</Typography>
          <Typography className={clsx(classes.scanTipDesc)}>
            Scan your identification card. Make sure to hold your phone steady. 
          </Typography>
        </Box>        
      </Box>
      <Box margin="16px" minHeight="80px" borderRadius="4px" overflow="hidden">
        <Box>
        <video
          className={classes.video}
          ref={this.videoRef}
          autoPlay={true}
          width="100%"
          id="idvideo"
        />
        </Box>
      </Box>      
        <Box width={1}>
          <Box marginTop={5} display="flex" justifyContent="center" width="100%">
            <Button onClick={this.openCantscanModal} className={clsx(classes.button, classes.cantscanButton)} variant="contained">Can't Scan?</Button>  
          </Box>           
        </Box>
      <Box padding="0px 10px">
        <Box className={clsx(classes.scanTip)}>
          <Typography className={clsx(classes.scanTipDesc)}>
            <strong>TIP</strong>: Try placing the card on a flat surface and holding your phone with both hands.            
          </Typography>
          <Typography className={clsx(classes.scanTipDesc)}>
            Position your phone's camera to cover as much as possible the barcode on the back of your ID.
          </Typography>
        </Box>
      </Box>
      <Box>
        <img src="https://ah-public-media.s3-us-west-2.amazonaws.com/images/IDSCAN-EXAMPLE.png" style={{maxWidth: "480px"}} width="100%" />
      </Box>
    </div>)
  }
}

const ScanIDCompose = compose(
  inject("store"),
  observer
) (ScanID);

export default withStyles(styles)(withMediaQuery()(ScanIDCompose));