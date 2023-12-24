import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import {compose} from "recompose";
import {inject, observer} from "mobx-react";

import { fade, makeStyles } from '@material-ui/core/styles';
import {IconButton, CircularProgress, Dialog, Link as MLink, Box, Container, Button, Chip, Grid, Avatar, Typography, withStyles} from "@material-ui/core";
import {Check as CheckIcon, Close as CloseIcon} from "@material-ui/icons";
import SvgIcon from '@material-ui/core/SvgIcon';

import styles from "./styles";
import clsx from 'clsx';
import withMediaQuery from "../../constants/mediaQuery";
import FooterContainer from "../../components/Footer";
import {getCookie} from "../../utils/cookie";

import ScanBox from './scan';
import moment from 'moment';

class ScanContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {      
      scanned: false,
      scanning: false,
      checkingScanStatus: true,  
      data: null
    }
  }  
  
  componentWillUnmount() {
    // window.removeEventListener("orientationchange", this.resizeCanvas);
  }

  componentDidMount() {
    const {store, location, match} = this.props;
    const {deliveryStore} = store;
    
    // window.addEventListener("orientationchange", this.resizeCanvas);

    deliveryStore.getDelivery(match.params.tracking_code, resp => {
      if (resp.ok) {
        let token = location.search.replace("?token=", "");    
        if (!token || token.trim() === '') {
          token = getCookie("axl_shipment_token");
        }

        console.log('token is: ', token)

        store.deliveryStore.isAllowScanId(match.params.tracking_code, token).then(resp => {            
          if (resp.ok) {
            if (!resp.data.allow_scan) {
              this.goBack()
            } else {
              this.setState({token, shipmentId: resp.data.shipment_id, settings: resp.data.settings});          
            }        
          } else {
            this.goBack();
          }
        })
      }
    });
  }
  
  goBack = () => {
    const {history, location} = this.props;
    history.replace(location.pathname.replace(/\/idscan[^\.]*$/g, ""));
  }

  goToScan = () => {
    const {history, location} = this.props;    
    history.replace(location.pathname + "/scan?token=" + this.state.token);
  }

  scan = (e) => {
    const {store, location, match} = this.props;

    store.deliveryStore.notifyID(this.state.data.content, match.params.tracking_code, this.state.shipmentId, this.state.token).then(resp => {
        if (resp.ok) {
          this.goBack();
        }          
    })
  }

  clear = (e) => {
    this.setState({
      scanned: false,
      data: null
    })
  }

  onConfirmScan = (data) => {
    this.setState({scanned: true});
    console.log('data is: ', data);
    this.setState({data});
  }
  
  render() {
    const {mediaQuery, classes, store, history} = this.props;
    const {delivery, trackingCode, settings, hideCompanyBranding} = store.deliveryStore;
    
    if (!delivery) return null;
    const {client, driver, shipment, outbound_events, dropoff, pickup } = delivery;
    var isScanPage = !!history.location.pathname && history.location.pathname.match(/\/scan$/g);
    
    return (
      <div style={{height: '100%'}}>
        {!isScanPage && <Container maxWidth={false} disableGutters className={classes.container}>          
            <Container className={classes.bodyContainer}>
                <Box mb={4}>
                    <Box p={mediaQuery.isMobile ? 2 : 4.5} pb={mediaQuery.isMobile ? 3 : undefined} className={classes.statusContainer} borderRadius='10px 10px 0 0'>
                        <Box mb={2.5} className={classes.statusTitle}>
                            <Box>
                                <span className={classes.statusText}>Status: </span>
                                <span className={classes.statusTextBig}>Identification required</span>
                            </Box>
                            <Box>
                                {shipment.attempt_count > 1 && <Chip size="small" className={classes.reattemptButton} label={'2nd attempt'} />}
                            </Box>
                        </Box>                      
                    </Box>
                    <Grid container className={classes.shipmentInfoContainer}>
                        <Grid item xs={12} sm={6} className={classes.shipmentInfoLeft}>
                            <Grid container spacing={2} style={{marginBottom: 15}}>
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
                                    <div>
                                        <span className={classes.grayText}>Tracking code: </span>
                                        <span className={classes.boldText}>{trackingCode}</span>
                                    </div>
                                </Grid>
                            </Grid>                          
                        </Grid>            
                        <Grid item xs={12}>
                          <Typography className={classes.signTitle}>
                          For this delivery to be completed, we must verify your identity. Please provide a scan of your ID card or driver’s license using the camera function below:
                          </Typography>                        
                          <Box display="flex" marginTop={1} alignItems="center" justifyContent="center" className={classes.scanPreviewBox} width="100%">
                            {this.state.data && <Box style={{position: 'absolute', top: 10, left: 10}}>
                              <Typography>{this.state.data.first_name} {this.state.data.middle_name} {this.state.data.last_name}</Typography>
                              <Typography>{moment(this.state.data.dob).format('MMM D, YYYY')}</Typography>
                            </Box>}              
                            <div>
                              <Button onClick={this.goToScan} className={!this.state.scanned ? clsx(classes.button, classes.scanButton): clsx(classes.button, classes.scanButton, classes.scanVisible)} color="primary" variant="contained" aria-label="scan">
                                <SvgIcon>
                                  <path d="M.5 6c.276 0 .5-.224.5-.5V1h4.5c.276 0 .5-.224.5-.5S5.776 0 5.5 0h-5C.224 0 0 .224 0 .5v5c0 .276.224.5.5.5zM23.5 0h-5c-.276 0-.5.224-.5.5s.224.5.5.5H23v4.5c0 .276.224.5.5.5s.5-.224.5-.5v-5c0-.276-.224-.5-.5-.5zM23.5 18c-.276 0-.5.224-.5.5V23h-4.5c-.276 0-.5.224-.5.5s.224.5.5.5h5c.276 0 .5-.224.5-.5v-5c0-.276-.224-.5-.5-.5zM.5 24h5c.276 0 .5-.224.5-.5s-.224-.5-.5-.5H1v-4.5c0-.276-.224-.5-.5-.5s-.5.224-.5.5v5c0 .276.224.5.5.5zM19.875 6H4.125C3.505 6 3 6.505 3 7.125v9.75C3 17.495 3.505 18 4.125 18h15.75c.62 0 1.125-.505 1.125-1.125v-9.75C21 6.505 20.495 6 19.875 6zM3.75 9h16.5v1.5H3.75V9zm.375-2.25h15.75c.207 0 .375.168.375.375V8.25H3.75V7.125c0-.207.168-.375.375-.375zm15.75 10.5H4.125c-.207 0-.375-.168-.375-.375V11.25h16.5v5.625c0 .207-.168.375-.375.375z"/>
                                  <path d="M18.667 15h-1.334c-.184 0-.333.224-.333.5s.15.5.333.5h1.334c.184 0 .333-.224.333-.5s-.15-.5-.333-.5zM15.667 15h-1.334c-.184 0-.333.224-.333.5s.15.5.333.5h1.334c.184 0 .333-.224.333-.5s-.15-.5-.333-.5zM12.667 15h-1.334c-.184 0-.333.224-.333.5s.15.5.333.5h1.334c.184 0 .333-.224.333-.5s-.15-.5-.333-.5zM9.667 15H8.333c-.184 0-.333.224-.333.5s.15.5.333.5h1.334c.184 0 .333-.224.333-.5s-.15-.5-.333-.5z"/>
                                </SvgIcon>
                              </Button>
                            </div>
                          </Box> 
                          <Box marginTop={1} display="flex" justifyContent="flex-end">                          
                            <MLink href="#" onClick={this.clear}>
                              Clear
                            </MLink>
                          </Box> 
                          <Box marginTop={5} display="flex" justifyContent="center">
                            <Button disabled={!this.state.scanned || this.state.scanning} color="primary" onClick={this.scan} className={clsx(classes.button, classes.dialogButton, classes.submitScanButton)} variant="contained">Confirm Identification</Button>  
                          </Box>                      
                        </Grid>          
                    </Grid>
                </Box>
            </Container>
          {(!settings || !settings.hide_footer || settings.hide_footer === 'false') && (
            <FooterContainer client={client} shipment={shipment} settings={settings} />
          )}
        </Container>}
        <Switch>
          <Route path="/:tracking_code/idscan/scan" render={props => <ScanBox 
            onConfirmScan={this.onConfirmScan} 
            {...props}
            token={this.state.token}
            />} />
        </Switch>
      </div>
    )
  }
}

const ScanCompose = compose(
  inject("store"),
  observer
) (ScanContainer);

export default withStyles(styles)(withMediaQuery()(ScanCompose));
