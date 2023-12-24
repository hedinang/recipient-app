import React, { useState } from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { Dialog, DialogContent, Button, makeStyles, CircularProgress } from '@material-ui/core';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import { Hr } from 'components/DeliveryManager';
import { ImagesThumb } from '../components/ImagesThumb';

import api from 'utils/api';
import useSearchParams from 'hooks/useSearchParams';

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    border: '1px dashed #979797',
    cursor: 'pointer',
  },
  heading: {
    marginTop: 0,
    color: '#656465',
    fontFamily: 'AvenirNext-Medium',
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    marginTop: 0,
  },
  text2: {
    color: '#626262',
    marginTop: 10,
    fontFamily: 'AvenirNext',
  },
  btn: {
    borderRadius: '2rem',
    marginLeft: '0 !important',
  },
  image: {
    width: '100%',
    objectFit: 'cover',
    marginBottom: '0.5rem',
  },
  add: {
    display: 'block',
    fontSize: '14px',
    color: '#4a90e2',
    textAlign: 'center',
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    border: 'none',
    textDecoration: 'underline',
    textUnderlineOffset: '0.2rem',
    cursor: 'pointer',
  },
  loading: {
    left: '40%',
    position: 'absolute',
  },
}));

const PreferPhotoDialog = compose(
  inject('store'),
  observer
)(({ store, setFinishUpFeedback, setIsOpeningPreferredPhoto }) => {
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const skipQuestions = searchParams.get('skip_questionnaire');

  const { deliveryStore } = store;
  const { delivery, isOpenPreferredPhoto } = deliveryStore;
  const preferredPhotos = delivery?.preferred_photo || [];
  const photos = preferredPhotos.map((url) => ({ url }));
  const [imageList, setImageList] = useState(photos);

  const handleChange = (e) => {
    const image = e.target.files[0];
    setImageList([...imageList, { url: image }]);
  };

  const handleDelete = (idx) => {
    setImageList(imageList.filter((_, index) => index !== idx));
  };

  const handleSubmit = () => {
    const formData = new FormData();
    const uploadImages = imageList.filter((img) => typeof img.url !== 'string');
    const uploadedImages = imageList
      .filter((img) => typeof img.url === 'string')
      .map((img) => img.url.split('?')[0])
      .filter(Boolean);

    formData.append('image_urls', uploadedImages.toString());
    uploadImages.forEach((s) => {
      formData.append('image', s.url);
    });
    setLoading(true);
    api.post(`delivery/${trackingCode}/${delivery.shipment.id}/update`, formData).then((response) => {
      if (response.status === 200) {
        if(isOpenPreferredPhoto) {
          setIsOpeningPreferredPhoto(false);
          deliveryStore.updateField('isOpenPreferredPhoto', false);
          setFinishUpFeedback(true);
          setLoading(false);
          handleCancel();
        }
        else {
          deliveryStore.getDelivery(trackingCode, () => {
            setLoading(false);
            handleCancel();
          });
        }
      } else {
        setLoading(false);
      }
    });
  };

  const handleCancel = () => {
    if(isOpenPreferredPhoto) {
      setIsOpeningPreferredPhoto(false);
      deliveryStore.updateField('isOpenPreferredPhoto', false);
    }
    else {
      searchParams.set('dialog', 'closed');
      if (!skipQuestions) searchParams.set('skip_questionnaire', 'skippable');
      setSearchParams(searchParams);
    }
  };

  return (
    <Dialog open maxWidth="md" fullWidth>
      <DialogHeader title="Preferred Drop-off" />
      <DialogContent>
        <p className={classes.text}>While AxleHire will attempt to complete your delivery change requests, you will not be able to update the scheduled delivery date.</p>
        <Hr />
        <p className={clsx(classes.text, classes.text2)}>Please provide a good delivery photo to help us deliver your package successfully! Photo examples can be your house, door, gate, pathway, etc.</p>
        <input type="file" hidden id="attachment" accept="image/png, image/jpeg" onChange={(e) => handleChange(e)} />
        {imageList.length > 0 ? (
          <>
            <div>
              <ImagesThumb pods={imageList} title="Preferred Drop-off" onDelete={handleDelete} />
            </div>
            <label htmlFor="attachment" className={classes.add}>
              + Add another photo
            </label>
          </>
        ) : (
          <div>
            <label htmlFor="attachment" className={classes.imageContainer}>
              <AddAPhotoIcon />
            </label>
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <Button disabled={loading} onClick={() => handleSubmit()} fullWidth className={classes.btn} size="medium" color="primary" variant="contained" disableElevation disableRipple>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
        <Button onClick={handleCancel} fullWidth className={classes.btn} size="medium" color="primary" variant="outlined" disableElevation disableRipple>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
});

export default PreferPhotoDialog;
