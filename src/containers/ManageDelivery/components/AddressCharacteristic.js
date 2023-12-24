import React from 'react';
import { get } from 'lodash';
import { compose } from 'recompose';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { FormControl, FormControlLabel, RadioGroup, Radio, makeStyles } from '@material-ui/core';

import { updateQuestionnaire } from 'utils/api';
import useSearchParams from 'hooks/useSearchParams';
import { GATED_ADDRESS, QUESTIONNAIRE_PROPERTIES, SINGLE_HOUSE, CHARACTERISTIC_HOUSE_GATED, CHARACTERISTIC_GATED, CHARACTERISTIC_HIGH_RISE } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '1rem',
    backgroundColor: '#f8f9f8',
  },
  title: {
    color: '#737273',
    fontSize: '16px',
    fontFamily: 'AvenirNext-Medium',
    marginBottom: 0,
  },
  checkbox: {
    color: '#0f0c1b',
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
  label: {
    color: '#8d8d8d',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
    lineHeight: 1,
  },
}));

const SINGLE_HOUSE_QUESTIONS = [{ type: CHARACTERISTIC_HOUSE_GATED, text: 'Is your house gated?' }];

const BUILDING_QUESTIONS = [
  { type: CHARACTERISTIC_GATED, text: 'Is your apartment complex/commercial building gated?' },
  { type: CHARACTERISTIC_HIGH_RISE, text: 'Is your apartment complex/commercial building a high-rise?' },
];

function AddressCharacteristic({ store }) {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const shipmentID = get(delivery, 'shipment.id');
  const questionnaire = get(delivery, 'recipient-questionnaire');
  const addressType = get(questionnaire, 'address_type');
  const addressCharacteristic = get(questionnaire, 'address_characteristic') || [];
  const completed = typeof questionnaire === 'object' && QUESTIONNAIRE_PROPERTIES.every((property) => questionnaire.hasOwnProperty(property));
  const availableQuestions = addressType === SINGLE_HOUSE ? SINGLE_HOUSE_QUESTIONS : BUILDING_QUESTIONS;
  const questions = availableQuestions.map((item) => {
    const existed = addressCharacteristic.find((ac) => ac.type === item.type);

    return { ...item, value: typeof existed !== 'undefined' ? String(existed.is_selected) : '' };
  });

  const onSuccess = (response) => {
    if (response.status !== 200) toast.error(<span className={classes.notice}>{response?.data?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });
  };

  const onError = (error) => {
    toast.error(<span className={classes.notice}>{error?.message || 'Something went wrong. Please try again!'}</span>, { hideProgressBar: true, theme: 'colored' });
  };

  const handleChange = (e) => {
    const { value, name } = e.target;
    const params = addressCharacteristic.filter((item) => item.type !== name);
    params.push({ type: name, is_selected: value === 'true' });

    deliveryStore.setAddressCharacteristic(params);
    updateQuestionnaire(trackingCode, shipmentID, { 'address_characteristic': params }).then(onSuccess).catch(onError);

    if ([CHARACTERISTIC_HOUSE_GATED, CHARACTERISTIC_GATED].includes(name) && value === 'true') {
      searchParams.delete('dialog');
      searchParams.set('reason', GATED_ADDRESS);
      setSearchParams(searchParams);
    }
  };

  if (!addressType && !completed) return null;

  return (
    <section>
      {questions.map((question) => (
        <React.Fragment key={question.type}>
          <h4 className={classes.title}>{question.text}</h4>
          <FormControl component="fieldset" fullWidth color="primary">
            <RadioGroup aria-label="address_characteristic" name={question.type} value={question.value} onChange={handleChange} className={classes.radioGroup}>
              <FormControlLabel value="true" control={<Radio color="primary" classes={{ colorPrimary: classes.radio }} />} label="Yes" classes={{ label: classes.label }} />
              <FormControlLabel value="false" control={<Radio color="primary" classes={{ colorPrimary: classes.radio }} />} label="No" classes={{ label: classes.label }} />
            </RadioGroup>
          </FormControl>
        </React.Fragment>
      ))}
    </section>
  );
}

export default compose(inject('store'), observer)(AddressCharacteristic);
