import React, { useState } from 'react'
import { Box, Button, CircularProgress, Grid, useMediaQuery } from '@material-ui/core'
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { useParams } from 'react-router-dom';

import api from 'utils/api';
import { useStyles } from './styles';
import PreferPhotoDialog from 'containers/ManageDelivery/Dialog/PreferPhotoDialog';

const SelectPreferredPhoto = compose(
  inject('store'),
  observer
)(({ store, closeDialog, setFinishUpFeedback }) => {
  const { deliveryStore, podStore } = store;
  const { delivery } = deliveryStore;
  const [imageList, setImageList] = useState(podStore.imagesPOD || []);
  const [idxSelectedImg, setIdxSelectedImg] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const { tracking_code } = useParams();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('xs'));
  const [isOpeningPreferredPhoto, setIsOpeningPreferredPhoto] = useState(false);

  const classes = useStyles();

  const handleChange = (e) => {
    const image = e.target.files[0];
    const uploadImages = [...imageList.filter(img => typeof img.url === 'string'), { url: image }];
    setImageList(uploadImages);
    setIdxSelectedImg(uploadImages?.length - 1);
  };

  const handleSelectPreferred = (idx) => {
    if(idx == idxSelectedImg) {
      setIdxSelectedImg(-1);
      return;
    }
    setIdxSelectedImg(idx);
  }

  const updatePreferredPhoto = (url, payload) => {
    setIsLoading(true);
    api.post(url, payload).then((response) => {
      setIsLoading(false);
      if (response.status === 200) {
        setIdxSelectedImg(-1);
        setFinishUpFeedback(true);
      } else {
        setFinishUpFeedback(false);
      }
    });
  }

  const handleSubmit = () => {
    if (idxSelectedImg === -1) {
      setFinishUpFeedback(true);
      return;
    }
    const formData = new FormData();
    const findPhoto = imageList?.find((img, idx) => idx == idxSelectedImg);
    if(typeof findPhoto?.url === 'string') {
      updatePreferredPhoto(`delivery/${tracking_code}/${delivery.shipment.id}/update-profile`, {image_urls: [findPhoto?.url?.split('?')?.[0]]});
    }
    else {
      formData.append('image', findPhoto.url);
      updatePreferredPhoto(`delivery/${tracking_code}/${delivery.shipment.id}/update`, formData);
    }
  }

  const handleCancel = () => {
    setFinishUpFeedback(true);
    setIdxSelectedImg(-1);
    deliveryStore.updateField('isSubmittedFeedback', false);
  }
  
  const handlePreferredPhoto = () => {
    setIsOpeningPreferredPhoto(true);
    deliveryStore.updateField('isOpenPreferredPhoto', true);
  }

  return (
    <>
      {!isOpeningPreferredPhoto && (
        <Grid container spacing={3} justify='center' className={classes.gridContainer}>
          <Grid item xs={12} className={classes.itemCenter}>
            <strong>To help us improve, please select the photo that best matches your preferred dropoff location.</strong>
          </Grid>
          <Grid item xs={12}>
                <Box display={'flex'} flexDirection={'row'} flexWrap='wrap' style={{gap: '5px'}} justifyContent={'center'}>
                  {imageList?.map((m, idx) => <img src={typeof m.url === 'string' ? m.url : URL.createObjectURL(m.url)} key={`image-${idx}`} 
                    style={{maxWidth: isMobile ? '30%' : '15%'}}
                    className={clsx({
                      [classes.imagePreferred]: true,
                      [classes.selectImgPreferred]: idx === idxSelectedImg,
                      [classes.notSelectImgPreferred]: idx !== idxSelectedImg && idxSelectedImg !== -1,
                    })}
                    onClick={() => handleSelectPreferred(idx)} 
                  />)}
                </Box>
        
                <Box textAlign={'center'} mt={4} mb={2}>or</Box>
                <Box display={'flex'} justifyContent={'center'}>
                  <Button onClick={handlePreferredPhoto} variant='outlined' classes={{root: classes.rootButton, label: classes.buttonLabel}} fullWidth={isMobile}>Upload My Preferred Dropoff Photo</Button>
                </Box>

            <Box display={'flex'} justifyContent={'flex-end'} mt={2} marginBottom={isMobile ? 10 : 0}>
              <Button onClick={handleCancel} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)} disabled={isLoading}>
                Cancel
              </Button>
              <Button color="primary" variant="contained" style={{ marginLeft: 5 }} className={clsx(classes.button, classes.dialogButton)} onClick={handleSubmit} disabled={isLoading || idxSelectedImg === -1 }>
                {isLoading && <CircularProgress size={20}/>}
                {!isLoading && 'Submit'}  
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
      {isOpeningPreferredPhoto && <PreferPhotoDialog setFinishUpFeedback={(val) => setFinishUpFeedback(val)} setIsOpeningPreferredPhoto={(val) => setIsOpeningPreferredPhoto(val)}/>}
    </>
  )
})

export default SelectPreferredPhoto
