import React from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core';

import { Section, EditButton } from 'components/DeliveryManager';
import { DELIVERY_INSTRUCTION } from 'constants/common';
import useSearchParams from 'hooks/useSearchParams';

const useStyles = makeStyles({
  text: {
    fontSize: '14px',
    color: '#b7b6b7',
    fontFamily: 'AvenirNext',
  },
  italic: {
    fontStyle: 'italic',
  },
});

export const DeliveryInstruction = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const instruction = delivery?.delivery_instruction;

  const handleOpenDialog = () => {
    searchParams.delete('dialog');
    searchParams.set('reason', DELIVERY_INSTRUCTION);
    setSearchParams(searchParams);
  };

  return (
    <Section>
      <div className="section__header">
        <span className="section__title">Delivery Instructions:</span>
        <EditButton size="small" variant="outlined" color="primary" onClick={handleOpenDialog}>
          Edit
        </EditButton>
      </div>
      <div className="section__body">
        {instruction ? (
          <p className={clsx(classes.text)}>{instruction}</p>
        ) : (
          <p className={clsx(classes.text, classes.italic)} onClick={handleOpenDialog}>
            Add instruction here...
          </p>
        )}
      </div>
    </Section>
  );
});
