import React, { useState } from 'react';
import { get } from 'lodash';
import { compose } from 'recompose';
import { toast } from 'react-toastify';
import { inject, observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { FormControl, RadioGroup, Radio, FormControlLabel, makeStyles } from '@material-ui/core';

import { updateQuestionnaire } from 'utils/api';
import useSearchParams from 'hooks/useSearchParams';
import { APARTMENT_COMPLEX, COMMERCIAL_BUILDING, ADDRESS_QUESTIONNAIRE } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  title: {
    color: '#737273',
    fontSize: '16px',
    fontFamily: 'AvenirNext-Medium',
    marginBottom: 0,
  },
  radioGroup: {
    [theme.breakpoints.up('sm')]: {
      columnGap: '3rem',
      flexDirection: 'row',
      minHeight: '60px',
    }
  },
  radio: {
    padding: '9px',
  },
  label: {
    color: '#8d8d8d',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
    lineHeight: 1,
  },
  notice: {
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
  },
}));

function AddressType({ store }) {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery, addressTypes } = deliveryStore;
  const shipmentID = delivery?.shipment?.id;
  const addressType = get(delivery, 'recipient-questionnaire.address_type') || '';

  const [type, setType] = useState(addressType);
  const options = addressTypes ? Object.keys(addressTypes).map((key) => ({ value: key, label: addressTypes[key] })) : [];

  const onSuccess = (response) => {
    if (response.status !== 200) toast.error(<span className={classes.notice}>{response?.data?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });
  };

  const onError = (error) => {
    toast.error(<span className={classes.notice}>{error?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setType(value);

    deliveryStore.setAddressType(value);
    updateQuestionnaire(trackingCode, shipmentID, { address_type: value }).then(onSuccess).catch(onError);

    if ([APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(value)) {
      searchParams.delete('dialog');
      searchParams.set('reason', ADDRESS_QUESTIONNAIRE);
      setSearchParams(searchParams);
    }
  };

  return (
    <section>
      <h4 className={classes.title}>What is your address type?</h4>
      <FormControl component="fieldset" fullWidth color="primary">
        <RadioGroup aria-label="address_type" name="address_type" value={type} onChange={handleChange} className={classes.radioGroup}>
          {options.map((option) => (
            <FormControlLabel key={option.value} value={option.value} control={<Radio color="primary" classes={{ colorPrimary: classes.radio }} />} label={option.label} classes={{ label: classes.label }} />
          ))}
        </RadioGroup>
      </FormControl>
    </section>
  );
}

export default compose(inject('store'), observer)(AddressType);
