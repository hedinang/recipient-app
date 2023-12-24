import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import {compose} from "recompose";
import {inject, observer} from "mobx-react";

import { fade, makeStyles } from '@material-ui/core/styles';
import {CircularProgress, Dialog, Link as MLink, Box, Container, Button, Chip, Grid, Avatar, Typography, withStyles} from "@material-ui/core";
import {Check as CheckIcon, Close as CloseIcon} from "@material-ui/icons";

import styles from "./styles";
import clsx from 'clsx';
import withMediaQuery from "../../constants/mediaQuery";
import FooterContainer from "../../components/Footer";
import SignatureBox from './sign';
import {getCookie} from "../../utils/cookie";
import SignatureCanvas from 'react-signature-canvas';

class SignatureContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signed: null,
      signing: false,
      checkingSignStatus: true,
    }
  }
  signature = null;
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

  componentWillUnmount() {
    window.removeEventListener("orientationchange", this.resizeCanvas);
  }

  componentDidMount() {
    const {store, location, match} = this.props;
    const {deliveryStore} = store;

    window.addEventListener("orientationchange", this.resizeCanvas);
    deliveryStore.getDelivery(match.params.tracking_code, resp => {
      if (resp.ok) {
        let token = location.search.replace("?token=", "");
        if (!token || token.trim() === '') {
          token = getCookie("axl_shipment_token");
        }
        store.deliveryStore.validateSignatureToken(token).then(resp => {
          this.setState({checkingSignStatus: false});
          if (resp.ok) {
            if (!resp.data) {
              this.gotoScan()
            } else {
              this.setState({token});
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
    this.setState({signed: false});
    history.replace(location.pathname.replace(/\/signature[^\.]*$/g, ""));
  }

  gotoScan = () => {
    const {history, location} = this.props;

    let token = location.search.replace("?token=", "");
    if (!token || token.trim() === '') {
      token = getCookie("axl_shipment_token");
    }

    this.setState({signed: false});
    history.replace(location.pathname.replace(/\/signature[^\.]*$/g,  "/idscan?token=" + token));
  }

  sign = (e) => {
    const {store} = this.props;
    if (!this.state.signed) return;

    const trimmedCanvas = this.signature.getTrimmedCanvas();

    this.setState({signing: true});
    store.deliveryStore.sign(trimmedCanvas.toDataURL(), this.state.token).then(resp => {
      this.setState({signing: false});
      if (resp.ok) {
        store.deliveryStore.delivery.signRequired = false;
        this.clear();
        if (store.deliveryStore.delivery && store.deliveryStore.delivery.shipment && store.deliveryStore.delivery.shipment.id_required) {
          this.gotoScan();
        } else {
          this.goBack();
        }
      }
    });
  }

  clear = (e) => {
    if (this.signature) {
      this.signature.clear();
      this.setState({signed: false});
    }
  }

  onEnd = () => {
    this.setState({signed: true});
  }

  render() {
    const {mediaQuery, classes, store} = this.props;
    const {delivery, trackingCode, settings, hideCompanyBranding} = store.deliveryStore;

    if (!delivery) return null;

    const {client, driver, shipment, outbound_events, dropoff, pickup } = delivery;

    return (
      <Container maxWidth={false} disableGutters className={classes.container}>
          <Container className={classes.bodyContainer}>
              <Box mb={4}>
                  <Box p={mediaQuery.isMobile ? 2 : 4.5} pb={mediaQuery.isMobile ? 3 : undefined} className={classes.statusContainer} borderRadius='10px 10px 0 0'>
                      <Box mb={2.5} className={classes.statusTitle}>
                          <Box>
                              <span className={classes.statusText}>Status: </span>
                              <span className={classes.statusTextBig}>Signature required</span>
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
                        To complete the delivery and confirm that you have received the shipment, please provide your signature in the box below:
                        </Typography>
                        <Typography style={{fontSize: '0.85rem', fontStyle: 'italic'}}>*(You can also rotate your device horizontally to expand your  signing space)</Typography>
                        <Box display="flex" marginTop={1} alignItems="center" justifyContent="center" className={classes.signPreviewBox} width="100%">
                        <SignatureCanvas onEnd={this.onEnd} ref={(ref) => { this.signature = ref }} penColor='black'
                            canvasProps={{className: classes.canvas}} />
                        </Box>
                        <Box marginTop={1} display="flex" justifyContent="flex-end">
                          <MLink href="#" onClick={this.clear}>
                            Clear
                          </MLink>
                        </Box>
                        <Box marginTop={5} display="flex" justifyContent="center">
                          <Button disabled={!this.state.signed || this.state.signing} color="primary" onClick={this.sign} className={clsx(classes.button, classes.dialogButton, classes.signatureButton)} variant="contained">Confirm Signature</Button>
                        </Box>
                      </Grid>
                  </Grid>
              </Box>
          </Container>
        {(!settings || !settings.hide_footer || settings.hide_footer === 'false') && (
          <FooterContainer client={client} shipment={shipment} settings={settings} />
        )}
      </Container>
    )
  }
}

const SignatureCompose = compose(
  inject("store"),
  observer
) (SignatureContainer);

export default withStyles(styles)(withMediaQuery()(SignatureCompose));
