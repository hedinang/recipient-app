import React from 'react';
import { get } from 'lodash';
import { compose } from 'recompose';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, TextField, Button, makeStyles } from '@material-ui/core';

import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import { Hr } from 'components/DeliveryManager';
import api from 'utils/api';
import useSearchParams from 'hooks/useSearchParams';

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'AvenirNext',
  },
  heading: {
    marginTop: 0,
    color: '#656465',
    fontFamily: 'AvenirNext-Medium',
  },
  title: {
    color: '#737273',
    fontSize: '16px',
    margin: '0 0 0.5rem 0',
    fontFamily: 'AvenirNext',
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    marginTop: 0,
  },
  input: {
    color: '#7b7b7b',
    fontSize: '14px',
  },
  btn: {
    borderRadius: '2rem',
    marginLeft: '0 !important',
  },
  notice: {
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
  },
  error: {
    margin: 0,
  },
}));
function InstructionDialog({ store }) {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const instruction = delivery?.delivery_instruction || '';
  const shipmentID = delivery?.shipment?.id;

  const { formState, handleSubmit, control } = useForm({ defaultValues: { delivery_instruction: instruction } });
  const { errors } = formState;
  const error = get(errors, 'delivery_instruction.message', '');

  const handleCancel = () => {
    searchParams.set('dialog', 'closed');
    setSearchParams(searchParams);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('delivery_instruction', data.delivery_instruction);

    api
      .post(`delivery/${trackingCode}/${shipmentID}/update`, formData)
      .then((response) => {
        if (response.status !== 200) return toast.error(<span className={classes.notice}>{response?.data?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });

        deliveryStore.getDelivery(trackingCode);
        handleCancel();
      })
      .catch((error) => toast.error(<span className={classes.notice}>{error?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' }));
  };

  return (
    <Dialog open maxWidth="md" fullWidth className={classes.root}>
      <DialogHeader title="Delivery Instructions" />
      <DialogContent>
        <p className={classes.text}>While AxleHire will attempt to complete your delivery change requests, you will not be able to update the scheduled delivery date.</p>
        <Hr />
        <p className={classes.title}>Delivery Instructions:</p>
        <Controller
          name="delivery_instruction"
          control={control}
          rules={{ minLength: { value: 3, message: 'This field should contain at least 3 characters' } }}
          render={({ field }) => <TextField {...field} FormHelperTextProps={{ className: classes.error }} error={Boolean(error)} helperText={error} InputProps={{ className: classes.input }} multiline fullWidth rows={5} size="small" variant="outlined" placeholder="Tell us more about where should we leave the package or tips to find your address!" />}
        />
      </DialogContent>
      <DialogFooter>
        <Button fullWidth size="medium" variant="contained" color="primary" className={classes.btn} onClick={handleSubmit(onSubmit)} disableElevation>
          Save
        </Button>
        <Button fullWidth size="medium" variant="outlined" color="primary" className={classes.btn} onClick={handleCancel} disableElevation>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default compose(inject('store'), observer)(InstructionDialog);
