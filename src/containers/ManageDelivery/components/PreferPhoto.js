import React from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import { makeStyles, useTheme, useMediaQuery } from '@material-ui/core';

import { ImagesThumb } from './ImagesThumb';
import { Section, EditButton, Hr } from 'components/DeliveryManager';

import useSearchParams from 'hooks/useSearchParams';
import { PREFER_POD, DELIVERY_PREFER_POD } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridAutoFlow: 'row',
    gap: '1rem',
    [theme.breakpoints.up('sm')]: {
      gridAutoFlow: 'column',
      gridTemplateColumns: '1fr 1px 2fr',
    },
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
  },
  icon: {
    fontSize: '1rem',
  },
  image: {
    width: '33.333%',
    marginRight: '5px',
    cursor: 'pointer',
    flex: '0 0 33.3333%',
  },
  imageMoreWrap: {
    display: 'flex',
    position: 'relative',
    flex: '0 0 33.3333%',
  },
  imageNumber: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.5rem',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    zIndex: 1,
  },
  preferImage: {
    width: '100%',
    objectFit: 'cover',
  },
  preferContainer: {
    minHeight: '120px',
    display: 'flex',
    alignItems: 'center',
  },
  hintText: {
    color: '#f5a623',
    fontSize: '13px',
    fontFamily: 'AvenirNext-Italic',
  },
  preferText: {
    color: '#b7b6b7',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Italic',
  },
}));

export const DeliveryPhoto = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const { pods, preferred_photo } = delivery;
  const preferPhotoList = preferred_photo?.map((p) => ({ url: p }));
  const reason = searchParams.get('reason');
  const highlight = reason === PREFER_POD;

  const handleOpenDialog = () => {
    searchParams.delete('dialog');
    searchParams.set('reason', DELIVERY_PREFER_POD);
    setSearchParams(searchParams);
  };

  return (
    <Section style={highlight ? { border: '1px solid #6c62f5' } : {}}>
      <div className="section__header">
        <span className="section__title">Preferred Drop-off:</span>
        <EditButton size="small" variant="outlined" color="primary" onClick={handleOpenDialog}>
          <AddAPhotoIcon className={classes.icon} />
        </EditButton>
      </div>
      <div className={clsx('section__body', classes.container)}>
        <div>
          <p className={classes.text}>Driver's Delivery Photo(s)</p>
          <div className={classes.preferContainer}>{pods && pods.length ? <ImagesThumb pods={pods} title={"Driver's Delivery Photo(s)"} style={desktop ? { gridTemplateColumns: '1fr' } : {}} limitPhotos={desktop ? 0 : 2} /> : <p className={classes.preferText}>Not yet delivered</p>}</div>
        </div>
        {desktop ? <Hr style={{ height: '100%', width: '1px', margin: 0 }} /> : <Hr />}
        <div>
          <p className={classes.text}>Your Photo(s)</p>
          <div className={classes.preferContainer}>{preferPhotoList.length ? <ImagesThumb title={'Preferred Delivery Photo'} pods={preferPhotoList} /> : <p className={classes.preferText}>Add drop-off photos to help drivers deliver to your address...</p>}</div>
        </div>
      </div>
      {highlight && <p className={classes.hintText}>*Thumbs Down POD - Delivery photo examples from you can be very useful for future deliveries.</p>}
    </Section>
  );
});
