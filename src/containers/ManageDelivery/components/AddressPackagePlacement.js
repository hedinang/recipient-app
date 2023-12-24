import React, { useState, useEffect } from 'react';
import { get, isEmpty } from 'lodash';
import { compose } from 'recompose';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { useForm, Controller } from 'react-hook-form';
import { FormControl, RadioGroup, FormControlLabel, Radio, TextField, makeStyles } from '@material-ui/core';

import { updateQuestionnaire } from 'utils/api';
import { QUESTIONNAIRE_PROPERTIES, SINGLE_HOUSE, APARTMENT_COMPLEX, COMMERCIAL_BUILDING, CHARACTERISTIC_HOUSE_GATED, CHARACTERISTIC_GATED, CHARACTERISTIC_HIGH_RISE } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: '1rem',
  },
  title: {
    color: '#737273',
    fontSize: '16px',
    fontFamily: 'AvenirNext-Medium',
    marginBottom: 0,
  },
  label: {
    color: '#8d8d8d',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
    lineHeight: 1,
  },
  radioGroup: {
    [theme.breakpoints.up('sm')]: {
      columnGap: '3rem',
      flexDirection: 'row',
      minHeight: '60px',
    },
  },
  radio: {
    padding: '9px',
  },
  instruction: {
    fontSize: '14px',
    fontFamily: 'AvenirNext',
  },
  error: {
    margin: 0,
  },
}));

function AddressPackagePlacement({ store }) {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const { handleSubmit, control, formState, setValue, clearErrors } = useForm({ defaultValues: { delivery_instruction: '' } });

  const [options, setOptions] = useState([]);
  const [placement, setPlacement] = useState('');

  const { deliveryStore } = store;
  const { delivery, dropoffPositions } = deliveryStore;
  const shipmentID = get(delivery, 'shipment.id');
  const deliveryInstruction = get(delivery, 'delivery_instruction', '');
  const questionnaire = get(delivery, 'recipient-questionnaire');
  const reason = get(questionnaire, 'delivery_reason', '');
  const addressType = get(questionnaire, 'address_type');
  const characteristic = get(questionnaire, 'address_characteristic', []);
  const completed = typeof questionnaire === 'object' && QUESTIONNAIRE_PROPERTIES.every((property) => questionnaire.hasOwnProperty(property));

  const { errors } = formState;
  const error = get(errors, 'delivery_instruction.message', '');

  const onSuccess = (response) => {
    if (response.status !== 200) toast.error(<span className={classes.notice}>{response?.data?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });
  };

  const onError = (error) => {
    toast.error(<span className={classes.notice}>{error?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });
  };

  const handleChange = (e) => {
    setPlacement(e.target.value);
    if (e.target.value === 'OTHER' && deliveryInstruction === '') return;

    clearErrors('delivery_instruction');
    setValue('delivery_instruction', deliveryInstruction);
    updateQuestionnaire(trackingCode, shipmentID, { delivery_reason: e.target.value }).then(onSuccess).catch(onError);
    deliveryStore.setDeliveryReason(e.target.value);
  };

  const onSubmitInstruction = (data) => {
    const { delivery_instruction } = data;

    updateQuestionnaire(trackingCode, shipmentID, { delivery_instruction, delivery_reason: placement }).then(onSuccess).catch(onError);
    deliveryStore.setDeliveryInstruction(delivery_instruction);
  };

  useEffect(() => {
    setPlacement(reason);
    setValue('delivery_instruction', deliveryInstruction);
  }, [deliveryInstruction, reason, setValue]);

  useEffect(() => {
    if (!addressType) return;

    const data = dropoffPositions[addressType] || {};
    setOptions(Object.keys(data).map((key) => ({ type: key, label: data[key] })));
  }, [addressType, dropoffPositions]);

  if (isEmpty(characteristic) && !completed) return null;
  if (addressType === SINGLE_HOUSE && characteristic.filter((c) => c.type === CHARACTERISTIC_HOUSE_GATED).length === 0) return null;
  if ([APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(addressType) && characteristic.filter((c) => [CHARACTERISTIC_GATED, CHARACTERISTIC_HIGH_RISE].includes(c.type)).length !== 2) return null;

  return (
    <section className={classes.root}>
      <h4 className={classes.title}>Where do you want your package to be delivered?</h4>
      <FormControl component="fieldset" fullWidth color="primary">
        <RadioGroup aria-label="delivery_reason" name="delivery_reason" value={placement} onChange={handleChange} className={classes.radioGroup}>
          {options.map((option) => (
            <FormControlLabel key={option.type} value={option.type} control={<Radio color="primary" classes={{ colorPrimary: classes.radio }} />} label={option.label} classes={{ label: classes.label }} />
          ))}
        </RadioGroup>
      </FormControl>
      {placement === 'OTHER' && (
        <Controller
          name="delivery_instruction"
          control={control}
          rules={{ required: { value: true, message: 'This field is required' }, minLength: { value: 3, message: 'This field should contain at least 3 characters' } }}
          render={({ field }) => <TextField {...field} InputProps={{ className: classes.instruction }} FormHelperTextProps={{ className: classes.error }} error={Boolean(error)} helperText={error} multiline fullWidth rows={2} placeholder="Enter specific delivery instructions here..." variant="outlined" onBlur={handleSubmit(onSubmitInstruction)} autoComplete="off" />}
        />
      )}
    </section>
  );
}

export default compose(inject('store'), observer)(AddressPackagePlacement);
