import React from 'react';
import { get, isEmpty } from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';

import { Heading } from 'components/DeliveryManager';
import AddressType from './AddressType';
import AddressCharacteristic from './AddressCharacteristic';
import AddressPackagePlacement from './AddressPackagePlacement';
import AddressQuestionnaireButton from './QuestionnaireButton';
import { QUESTIONNAIRE_PROPERTIES } from 'constants/common';
import useSearchParams from 'hooks/useSearchParams';

const useStyles = makeStyles({
  root: {
    marginBottom: '1rem',
  },
  text: {
    color: '#878687',
    fontSize: '14px',
  },
});

export const AddressQuestionnaire = compose(
  inject('store'),
  observer
)((props) => {
  const classes = useStyles();
  const [searchParams] = useSearchParams();

  const { store } = props;
  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const questionnaire = get(delivery, 'recipient-questionnaire');
  const doing = typeof questionnaire === 'object' && QUESTIONNAIRE_PROPERTIES.some((property) => questionnaire.hasOwnProperty(property));
  const skip = searchParams.get('skip_questionnaire');

  const skipStatuses = ['skippable'];
  const show = (isEmpty(questionnaire) && (isEmpty(skip) || skip !== 'skipped')) || skipStatuses.includes(skip) || doing;

  if (!delivery) return null;

  return (
    <div className={classes.root}>
      <Heading style={{ textDecoration: 'underline' }}>Address Questionnaire {show ? <ArrowDropDown /> : <ArrowDropUp />}</Heading>
      <p className={classes.text}>{doing || skip === 'skippable' ? 'Please complete before going to Delivery Details.' : 'Please complete this short form to proceed to update delivery details.'}</p>
      {show && (
        <>
          <AddressType />
          <AddressCharacteristic />
          <AddressPackagePlacement />
        </>
      )}
      <AddressQuestionnaireButton />
    </div>
  );
});
