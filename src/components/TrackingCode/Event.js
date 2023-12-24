import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import clsx from 'clsx';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import { Box, Container, Dialog, Grid, useMediaQuery, Button } from '@material-ui/core';
import { Check, Close } from '@material-ui/icons';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';

import { getCookie, setCookie } from '../../utils/cookie';
import DialogStepOne from './Dialogs/DialogStepOne';
import DialogStepThree from './Dialogs/DialogStepThree';
import DialogStepTwo from './Dialogs/DialogStepTwo';
import PreviewImage from '../PreviewImage';
import PODThumbDown from 'components/Dialog/PODThumbDown';
import DialogFeedback from 'containers/main/Dialog/DialogFeedback';

import { DAY_IN_MILLISECONDS } from 'constants/common';
import { VERIFICATION } from '../../constants/verification';
import * as SHIPMENT_STATUS from '../../constants/shipmentStatus';
import useSearchParams from '../../hooks/useSearchParams';

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import './slick.css'

function Event(props) {
  const [searchParams] = useSearchParams();
  const history = useHistory();

  const { classes, delivery, progress, translatedEvents, deliveryStore, podStore } = props;

  const [showDialogNext, setShowDialogNext] = useState(0)
  const [open, setOpen] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const imageRef = useRef(null);
  const [hasToken, setHasToken] = useState(false);
  const [images, setImages] = useState([])
  const hasAccepted = delivery?.shipmentImageAnnotations?.filter(f => f.status === 'ACCEPTED')?.length > 0;
  const [currentSlide, setCurrentSlide] = useState(0)
  const enablePOD = delivery?.settings?.enable_pod?.toLocaleLowerCase() == 'true';
  const isDropoffSucceed = delivery?.shipmentImageAnnotations.some(sia => sia.stop_id == delivery?.dropoff?.id && sia.status === "ACCEPTED") && delivery?.dropoff?.status == "SUCCEEDED";
  const [isThumbDown, setIsThumbDown] = useState(false);
  const [isOpenFeedback, setIsOpenFeedback] = useState(false);
  const isAlreadyRequested = podStore.isRequested || delivery?.shipmentImageAnnotations.some(sia => sia.requested_ts);
  const { shipment, outbound_events } = delivery;

  const milestones = outbound_events.map((e) => e.milestone).filter(Boolean);
  const milestone = milestones[0] || SHIPMENT_STATUS.PROCESSING;
  const isDelivered = milestone === SHIPMENT_STATUS.DELIVERED;

  const renderText = (event) => event.description;
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('xs'));

  useEffect(() => {
    let token = searchParams.get('axl_shipment_token') || searchParams.get('t');
    if (!token) token = deliveryStore.token || getCookie('axl_shipment_token');

    if(!token) setHasToken(false);

    if (token) {
      try {
        deliveryStore.getTokenInfo(token, (res) => {
          if (res.ok) {
            setHasToken(true);
            const ttl = _.get(res, 'data.ttl', 0);
            setCookie("axl_shipment_token", token, ttl / DAY_IN_MILLISECONDS);

            if (!isDelivered) return history.replace(`/${deliveryStore.trackingCode}/edit`);

            if (enablePOD) {
              deliveryStore.getFeedback();
              deliveryStore.getPOD(res => {
                if (!res.ok || (res.data && (res.data.code === 404 || res.data.code === 500))) {
                  setImages([]);
                } else {
                  setImages(res.data);
                  podStore.setImagesPOD(res.data);
                  if(res.data?.length > 0) {
                    const isShowPOD = searchParams.get('pod');
                    if(isShowPOD == 1 || isShowPOD?.toLocaleLowerCase() == 'true') {
                      handlePreviewImage(null, 0);
                    }
                    deliveryStore.getPackageLocation();
                  }
                }
              })
            }
          } else {
            deliveryStore.updateField('token', null);
            history.replace(`/${deliveryStore.trackingCode}`)
            setCookie("axl_shipment_token", '', 0);
            setHasToken(false)
          }
        })
      } catch (error) {
        setHasToken(false)
        deliveryStore.updateField('token', null);
        history.replace(`/${deliveryStore.trackingCode}`)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryStore, enablePOD, podStore, searchParams, isDelivered, history]);

  useEffect(() => {
    const token = deliveryStore.token || getCookie('axl_shipment_token');
    setHasToken(!!token)
    if(!isMobile && [1,2].includes(podStore.currentStep) && podStore.isPODFeedback) {
      setOpen(true);
      setShowDialogNext(podStore.currentStep);
    }
  }, [deliveryStore.token, isMobile, podStore.currentStep, podStore.isPODFeedback])

  useMemo(() => {
    setImages(podStore.imagesPOD);
  }, [podStore.imagesPOD])
  
  const handlePhotoOfDelivery = (e) => {
    e.preventDefault();
    setOpen(true);
    setShowDialogNext(1);
    podStore.updateCurrentStep(1);
    podStore.updateField('isPODFeedback', true);
  }

  const handleCloseDialog = () => {
    setOpen(false);
    setShowDialogNext(0);
    deliveryStore.setCodeVerified();
    deliveryStore.setVerificationMethod(VERIFICATION.SMS)
    podStore.updateCurrentStep(0);
    podStore.updateIsRequested(false);
  }

  const handleNext = (v) => {
    setShowDialogNext(v);
    podStore.updateCurrentStep(v);
  }

  const setToken = (valToken, time, step) => {
    setCookie("axl_shipment_token", valToken, time);
    podStore.updateField('currentStep', step);
    podStore.updateField('isPODFeedback', true);
    if(isMobile || step === 4) {
      deliveryStore.openDialog(4);
    }
  }

  const handlePreviewImage = (e, idx) => {
    const token = getCookie('axl_shipment_token');
    if(!token) {
      setToken('', 0, 1);
      podStore.setImagesPOD([]);
      return;
    }
    if(_.isEmpty(deliveryStore.feedback)) {
      try {
        deliveryStore.getTokenInfo(token, (res) => {
          if (res.ok) {
            const ttl = _.get(res, 'data.ttl', 0);
            setToken(token, ttl / DAY_IN_MILLISECONDS, 4);
          } else {
            setToken('', 0, 1);
            podStore.setImagesPOD([]);
          }
        })
      } catch (error) {
        podStore.setImagesPOD([]);
        console.error(error);
      }
      return;
    }
    setIsPreview(true);
    setCurrentSlide(idx);
    setTimeout(() => {
      if(imageRef.current)
        imageRef.current.slickGoTo(idx);
    }, 0);
    podStore.updateField('isPODFeedback', true);
  };

  const handleClosePreview = () => {
    setIsPreview(false);
    podStore.updateField('isPODFeedback', false);
    podStore.updateField('isPreviewImage', false);
    if(!podStore.isChanged || podStore.isDisplayed) {
      return;
    }

    if(images?.some(s => s.hasOwnProperty('thumb') && !s.thumb)) {
      setIsThumbDown(true);
      podStore.updateField('isDisplayed', false);
      podStore.updateField('isChanged', false);
      return;
    }
  }

  const handleRequestPOD = (e) => {
    e.preventDefault();
    setOpen(true);
    setShowDialogNext(1);
    podStore.updateCurrentStep(1);
    podStore.updateIsRequested(true);
  }

  // const handleCloseRequestPOD = () => {
  //   setIsShowRequestPOD(false);
  // }

  const closePopUp = () => {
    setIsThumbDown(false);
    podStore.updateField('isDisplayed', false);
    podStore.updateField('isChanged', false);
  }

  const handleCloseFeedback = () => {
    setIsOpenFeedback(false);
    deliveryStore.setStep(1);
    podStore.updateField('isDisplayed', false);
    podStore.updateField('isChanged', false);
    deliveryStore.getFeedback();
  }

  const handleClose = () => {
    setOpen(false);
    podStore.updateCurrentStep(0);
  }
  const canRequestPOD = (mstone) => {
    //temporary turn off
    // const isHavePODAnnotation = delivery?.shipmentImageAnnotations.some(sia => sia.stop_id == delivery?.dropoff?.id);
    // if (SHIPMENT_STATUS.DELIVERED === mstone && enablePOD && !hasAccepted && !isAlreadyRequested && isHavePODAnnotation ){
    //   return true;
    // }
    return false
  }
  return (
    <>
    <Grid item xs={12} sm={6} className={classes.bodyItemWrapper}>
      <Container className={clsx(classes.bodyBottomItem, classes.boxWrapper)}>
        {translatedEvents.map((event, idx) => {
          const text = renderText(event);

          if (!text) return null;

          const eventDate = moment(event.ts).tz(shipment.timezone || 'America/Los_Angeles').format('MMM DD');
          const eventTime = moment(event.ts).tz(shipment.timezone || 'America/Los_Angeles').format('hh:mm A');
          const mstone = event.milestone;

          return (
            <Fragment key={idx} >
              <Grid container className={classes.deliveryStep}>
                <Grid item xs={3} className={clsx(classes.deliveryStepCell, classes.deliveryStepCellDateTime)}>
                  <div className={classes.deliveryStepDate}>{eventDate}</div>
                  <div className={classes.deliveryStepTime}>{eventTime}</div>
                </Grid>
                <Grid
                  item
                  xs={1}
                  className={clsx({
                    [classes.deliveryStepCell]: true,
                    [classes.deliveryStepCellIcon]: true,
                    [classes.deliveryStepConnector]: idx + 1 < translatedEvents.length,
                  })}
                >
                  <Box className={clsx(classes.statusIndicator)} style={{ backgroundColor: progress[mstone].backgroundColor }}>
                    {[SHIPMENT_STATUS.UNDELIVERABLE_SH, SHIPMENT_STATUS.FAILED, SHIPMENT_STATUS.CANCELLED].includes(mstone) ? <Close className={classes.whiteIcon} /> : <Check className={classes.whiteIcon} />}
                  </Box>
                </Grid>
                <Grid item xs={9} className={classes.deliveryStepCell}>
                  <div>{text}</div>
                  {
                    SHIPMENT_STATUS.DELIVERED === mstone && hasAccepted && enablePOD && isDropoffSucceed && images?.length === 0 && (
                      <div style={{fontWeight: 600, marginTop: '8px'}}>
                        You may view your <a href='#' onClick={handlePhotoOfDelivery} style={{color: '#4a90e2'}}>Photo of Delivery</a> here.
                      </div>
                    )
                  }

                  {SHIPMENT_STATUS.DELIVERED === mstone && hasAccepted && enablePOD && isDropoffSucceed && images?.length > 0 && (
                    <Fragment>
                      <span style={{color: '#2a2444', textDecoration: 'underline', fontWeight: 500}}>Below is your Photo of Delivery:</span>
                      <Box style={{marginTop: '8px', display: 'flex'}}>
                        {
                          images?.map((m, idx) => {
                            if(idx < 2) {
                              return (<img src={m?.url}
                                  style={{width: '33.333%', marginRight: '5px', cursor: 'pointer', flex: '0 0 33.3333%', maxHeight: isMobile ? '100px' : '100%'}} onClick={(e) => handlePreviewImage(e, idx)}
                                  key={`image-${idx}`}
                                />)
                            }

                            if(idx === 2) {
                              return (
                                <div style={{display: 'flex', position: 'relative', flex: '0 0 33.3333%'}} key={`image-${idx}`}>
                                  {images.length - 3 > 0 && (
                                    <span
                                      style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem', color: 'white', cursor: 'pointer', fontWeight: 700, zIndex: 1}}
                                      onClick={(e) => handlePreviewImage(e, idx)}
                                    >+{images.length - 2}</span>
                                  )}
                                  <img src={m?.url} style={{width: '33.3333%', marginRight: '5px', cursor: 'pointer', filter: images.length - 3 > 0 ? 'brightness(0.7)' : '', WebkitFilter: images.length - 3 > 0 ? 'brightness(0.7)': '', flex: '0 0 100%', maxHeight: isMobile ? '100px' : '100%'}} onClick={(e) => handlePreviewImage(e, idx)}/>
                                </div>
                              )
                            }
                          })
                        }
                      </Box>
                    </Fragment>
                  )}

                  {!hasToken && canRequestPOD(mstone) && <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span style={{color: '#eb9402', fontSize: '15px', margin: '8px 0'}}>Please request for your Photo of Delivery to be sent to you.</span>
                    <Button variant='outlined' style={{width: '150px', borderRadius: '25px', fontSize: '15px', color: '#eb9402', border: '1px solid #eb9402', textTransform: 'none'}}
                      onClick={handleRequestPOD}
                    >
                      Request POD
                    </Button>
                  </div>}

                  {/* {SHIPMENT_STATUS.DELIVERED === mstone && isAlreadyRequested && !hasAccepted && <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span style={{color: '#eb9402', fontSize: '15px', margin: '8px 0'}}>POD is successfully requested and will be sent to you once it is ready.</span>
                  </div>} */}
                </Grid>
              </Grid>
              <Dialog
                open={open && !isMobile}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth='md'
              >
                {showDialogNext === 1 && !isMobile && <DialogStepOne handleClose={handleCloseDialog} delivery={delivery} handleNext={v => handleNext(v)}/>}
                {showDialogNext === 2 && !isMobile && <DialogStepTwo handleClose={handleCloseDialog} delivery={delivery} handleNext={v => handleNext(v)} setHasToken={(val) => setHasToken(val)}/>}
                {showDialogNext === 3 && !isMobile && <DialogStepThree handleClose={handleClose} isSuccess={hasToken} setImages={images => setImages(images)}/>}
              </Dialog>

              <PreviewImage isPreview={isPreview || podStore.isPreviewImage} images={images} imageRef={imageRef} handleClosePreview={handleClosePreview} deliveryStore={deliveryStore} setImages={(v) => setImages(v)} currentSlide={currentSlide} setCurrentSlide={v => setCurrentSlide(v)}/>
            </Fragment>
          );
        })}
      </Container>
    </Grid>
    <Dialog
        open={isThumbDown}
        maxWidth="sm"
        PaperProps={{ style: { padding: '16px 0' }}}
        className={classes.container}
        onClose={closePopUp}
      >
        <PODThumbDown handleClose ={closePopUp} trackingCode={deliveryStore.trackingCode} />
    </Dialog>
    <Dialog
        open={isOpenFeedback}
        maxWidth="md"
        PaperProps={{ style: { padding: '16px 0' }}}
        className={classes.container}
        fullWidth
      >
        <DialogFeedback closeDialog={handleCloseFeedback} isDisplayPackage={false} isDisplayMenu={false}/>
    </Dialog>
    </>
  );
}

const EventCompose = compose(inject('store'), observer)(Event);
export default EventCompose
