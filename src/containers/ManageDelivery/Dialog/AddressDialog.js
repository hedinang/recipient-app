import React, { useState } from 'react';
import { compose } from 'recompose';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Dialog, DialogContent, Button, TextField, makeStyles } from '@material-ui/core';

import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import { Hr } from 'components/DeliveryManager';
import useSearchParams from 'hooks/useSearchParams';
import api from 'utils/api';

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'AvenirNext',
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    marginTop: 0,
  },
  description: {
    color: '#a2a2a2',
    fontSize: '14px',
    fontStyle: 'italic',
    fontFamily: 'AvenirNext',
  },
  label: {
    color: '#8d8d8d',
    fontSize: '14px',
  },
  value: {
    color: '#737273',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
  },
  input: {
    fontSize: '12px',
  },
  btn: {
    borderRadius: '2rem',
    marginLeft: '0 !important',
  },
  form: {
    display: 'grid',
    gridAutoFlow: 'row',
    [theme.breakpoints.up('sm')]: {
      gridAutoFlow: 'column',
      gridTemplateColumns: '100px 1fr',
    },
  },
}));

function AddressDialog({ store }) {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const address = delivery?.shipment?.dropoff_address;
  const address2 = address?.street2 || '';
  const shipmentID = delivery?.shipment?.id;

  const [text, setText] = useState(address2);

  const handleSubmit = () => {
    const data = { street2: text };
    api.post(`delivery/${trackingCode}/${shipmentID}/edit`, data).then((response) => {
      if (response.status !== 200) return toast.error(<span>{response?.data?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });

      deliveryStore.getDelivery(trackingCode);
      handleCancel();
    });
  };

  const handleCancel = () => {
    searchParams.set('dialog', 'closed');
    setSearchParams(searchParams);
  };

  return (
    <Dialog open maxWidth="md" fullWidth className={classes.root}>
      <DialogHeader title="Address" />
      <DialogContent>
        <p className={classes.text}>While AxleHire will attempt to complete your delivery change requests, you will not be able to update the scheduled delivery date.</p>
        <Hr />
        <p className={classes.description}>
          We can only assist you to change Address Line 2 online. To change full address, please contact <a href="mailto:support@axlehire.com">support</a>.
        </p>
        <div className={classes.form}>
          <p className={classes.label}>Address 1:</p>
          <p className={classes.value}>{address?.street || 'N/A'}</p>
        </div>
        <div className={classes.form}>
          <p className={classes.label}>Address 2:</p>
          <TextField size="small" variant="outlined" fullWidth InputProps={{ className: classes.input }} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className={classes.form}>
          <p className={classes.label}>City:</p>
          <p className={classes.value}>{address?.city}</p>
        </div>
        <div className={classes.form}>
          <p className={classes.label}>State:</p>
          <p className={classes.value}>{address?.state}</p>
        </div>
        <div className={classes.form}>
          <p className={classes.label}>Zipcode:</p>
          <p className={classes.value}>{address?.zipcode}</p>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button fullWidth size="medium" variant="contained" color="primary" className={classes.btn} onClick={handleSubmit} disableElevation>
          Save
        </Button>
        <Button fullWidth size="medium" variant="outlined" color="primary" className={classes.btn} onClick={handleCancel} disableElevation>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default compose(inject('store'), observer)(AddressDialog);
