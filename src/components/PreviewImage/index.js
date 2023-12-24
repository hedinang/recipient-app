import React, { useState } from 'react'
import Slider from "react-slick";
import GetAppIcon from '@material-ui/icons/GetApp';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Divider, makeStyles, useMediaQuery } from '@material-ui/core';

import DialogFeedback from 'containers/main/Dialog/DialogFeedback';
import PODThumbDown from 'components/Dialog/PODThumbDown'
import styles from 'containers/main/styles';

function PreviewImage({ textTitle, isPreview, handleClosePreview, images, imageRef, store, setImages, currentSlide, setCurrentSlide, onDelete }) {
    const [isOpenFeedback, setIsOpenFeedback] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [isThumbDown, setIsThumbDown] = useState(false);
    const {deliveryStore, podStore} = store;
    const {feedback} = deliveryStore;
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('xs'));
    const classes = makeStyles(styles)();

    const GalleryPrevArrow = ({ currentSlide, slideCount, ...props }) => {
        const { onClick } = props;

        return (
          <div {...props} className={`custom-prevArrow ${currentSlide === 0 && 'arrow-hiden'}`} onClick={onClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
            </svg>
          </div>
        );
    };
    const GalleryNextArrow = ({ currentSlide, slideCount, ...props }) => {
        const { onClick } = props;

        return (
          <div {...props} className={`custom-nextArrow ${currentSlide === images?.length - 1 && 'arrow-hiden'}`} onClick={onClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" />
            </svg>
          </div>
        );
    };

    const settings = {
        dots: false,
        fade: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <GalleryNextArrow />,
        prevArrow: <GalleryPrevArrow />,
        afterChange: current => setCurrentSlide(current)
    };

    const handleRatePOD = (value) => {
        const podID = images[currentSlide]?.id;
        if(!podID) return;
        deliveryStore.ratePOD(podID, value, res => {
          if(res.ok) {
            deliveryStore.setStep(4);
            podStore.updateField('isChanged', true);
            const tempImages = images.map(i => {
              if(i.id === podID) {
                i['thumb'] = value;
              }
              return i;
            })
            podStore.setImagesPOD(tempImages);
            setImages(tempImages)
            if(tempImages?.filter(t => t.hasOwnProperty('thumb'))?.length == images?.length) {
              if(_.isEmpty(feedback))  {
                podStore.updateField('isDisplayed', true);
                setIsOpenFeedback(true);
                return;
              }

              if(tempImages?.some(t => t.hasOwnProperty('thumb') && !t.thumb)) {
                podStore.updateField('isDisplayed', true);
                setIsThumbDown(true);
                return;
              }
            }
          }
          else {
            if(res?.status === 401 || res?.status === 403) {
              setIsExpired(true);
            }
            else {
              toast.error(res?.data?.errors || res?.data?.message || 'Updated fail')
            }
          }
        })
    }

    const handleDownloadImage = (e) => {
        e.preventDefault();
        const url = images[currentSlide]?.url;
        if(!url) return;

        fetch(url, {method: 'GET', cache: 'no-cache'})
        .then(res => {
          return res.blob();
        })
        .then(blob => {
          saveAs(blob, `photo-of-delivery-${new Date().getTime()}.png`)
        })
        .catch(err => {
          console.error('err: ', err);
        })
    }

    const handleCloseFeedback = () => {
      setIsOpenFeedback(false);
      deliveryStore.setStep(1);
    }

    const closePopUp = () => {
      setIsThumbDown(false);
    }
    const handleOk = () => {
      window.location.reload(true);
    }
    return (
      <>
        <Dialog
            open={isPreview}
            onClose={handleClosePreview}
            fullWidth
        >
            <DialogTitle disableTypography>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 style={{ fontFamily: 'AvenirNext-Medium', color:'#656465' }}>{textTitle || 'Photo of Delivery'}</h3>
                <IconButton onClick={handleClosePreview}>
                  <ClearIcon />
                </IconButton>
                </div>
            </DialogTitle>
            <DialogContent style={{paddingLeft: '10px', paddingRight: '10px'}}>
                <Slider {...settings} ref={imageRef}>
                    {
                        images?.map((m, idx) => (
                        <div key={idx} style={{display: 'flex', flexDirection: 'column'}}>
                            <div style={{position: 'relative'}}>
                              <img alt="" src={typeof m?.url === 'string' ? m?.url : URL.createObjectURL(m.url)} style={{margin: '0 auto', maxWidth: '100%', maxHeight: isMobile ? '400px' : '550px', minHeight: '350px'}}/>
                              <div style={{position: 'absolute', right: 15, bottom: 10, backgroundColor: 'rgba(252, 252, 255, .5)', borderRadius: '50%', padding: '2px 4px', zIndex: 1}}>
                              {typeof onDelete === 'function' ? (
                                <IconButton size="medium" onClick={() => onDelete(idx)}>
                                  <DeleteIcon fontSize="inherit" />
                                </IconButton>
                              ) : (
                                <IconButton size="medium" onClick={(e) => handleDownloadImage(e)}>
                                  <GetAppIcon fontSize="inherit" />
                                </IconButton>
                              )}
                              </div>
                            </div>
                            {!textTitle && (<>
                              <Divider style={{margin: '25px 5px'}}/>
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', position:'relative', zIndex: 1}}>
                                <span style={{fontWeight: 600, color: '#4a4a4a'}}>Is this photo a good delivery photo?</span>
                                <div style={{margin: '20px 0', width: '100px', display: 'flex', justifyContent: 'space-between'}}>
                                    <ThumbUpAltIcon fontSize='large' style={{cursor: 'pointer'}} htmlColor={m?.thumb === true ? '#4abc4e' : '#8d8d8d'} onClick={() => handleRatePOD(true)}/>
                                    <ThumbDownAltIcon fontSize='large' color={m?.thumb === false ? 'error' : 'action'} style={{cursor: 'pointer'}} onClick={() =>handleRatePOD(false)}/>
                                </div>
                            </div>

                            {/* {m?.thumb === false && <Box style={{backgroundColor: '#f6f5f8' ,padding: '9px 7px 11px 12px'}}>
                            <span style={{fontWeight: 500, color: '#626262', display: 'block', marginBottom: '10px', lineHeight: '1.65'}}>Thank you for your feedback. AxleHire will review this delivery.</span>
                            <span style={{fontWeight: 500, color: '#626262', display: 'block', lineHeight: '1.65'}}>Please proceed to our <a href='#' onClick={handleManageDelivery}>Manage Delivery</a> feature to upload example delivery photos or update location pins for future deliveries.</span>
                            </Box>*/}
                            </>)}
                        </div>)
                        )
                    }
                </Slider>

            </DialogContent>
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

        <Dialog
          open={isThumbDown}
          maxWidth="sm"
          PaperProps={{ style: { padding: '16px 0' }}}
          className={classes.container}
          onClose={closePopUp}
          fullWidth
        >
          <PODThumbDown handleClose ={closePopUp} trackingCode={deliveryStore.trackingCode} />
        </Dialog>
        <Dialog
          open={isExpired}
          maxWidth="md"
        >
          <DialogContent dividers>
            Sorry, your token has been expired.
          </DialogContent>
          <DialogActions>
            <Button variant='contained' color='primary' onClick={handleOk}>OK</Button>
          </DialogActions>
        </Dialog>
      </>
    )
}

const PreviewImageCompose = compose(inject('store'), observer)(PreviewImage);
export default PreviewImageCompose
