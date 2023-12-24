import React, { useEffect } from 'react';
import { get } from 'lodash';
import { compose } from 'recompose';
import { useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core';
import Footer from 'components/Footer/FooterContainer';

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  heading: {
    color: '#2a2444',
  },
  text: {
    color: '#5a5a5a',
  },
});

function Thankyou({ store }) {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const { deliveryStore } = store;
  const { settings, delivery } = deliveryStore;
  const client = get(delivery, 'client');

  useEffect(() => {
    if (settings && client) return;

    deliveryStore.getDelivery(trackingCode);
  }, [client, deliveryStore, settings, trackingCode]);

  return (
    <>
      <div className={classes.root}>
        <h2 className={classes.heading}>Thank you!</h2>
        <p className={classes.text}>Thank you for updating your delivery details!</p>
      </div>
      <Footer styles={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
    </>
  );
}

export default compose(inject('store'), observer)(Thankyou);
