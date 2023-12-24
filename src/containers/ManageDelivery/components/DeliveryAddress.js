import React from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core';

import { Section, EditButton } from 'components/DeliveryManager';
import useSearchParams from 'hooks/useSearchParams';
import { DELIVERY_ADDRESS } from 'constants/common';

const useStyles = makeStyles({
  text: {
    marginTop: 0,
    fontSize: '14px',
    color: '#868686',

    '&__bold': {
      fontWeight: 700,
    }
  },
  notice: {
    fontSize: '13px',
    color: '#f5a623',
    fontStyle: 'italic',
  },
});

export const DeliveryAddress = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;

  const address = delivery?.shipment?.dropoff_address;

  const handleOpenDialog = () => {
    searchParams.delete('dialog');
    searchParams.set('reason', DELIVERY_ADDRESS);
    setSearchParams(searchParams);
  };

  return (
    <Section>
      <div className="section__header">
        <p className="section__title">Delivery Address:</p>
        <EditButton size="small" variant="outlined" color="primary" onClick={handleOpenDialog}>
          Edit
        </EditButton>
      </div>
      <div className="section__body">
        <p className={classes.text}>{address?.street || 'N/A'}</p>
        <p className={clsx(classes.text, `${classes.text}__bold`)}>{address?.street2 || 'N/A'}</p>
        <p className={classes.text}>{address?.city}, {address?.state}, {address?.zipcode}</p>
        <span className={classes.notice}>Please contact <a href="mailto:support@axlehire.com">support</a> to update your address.</span>
      </div>
    </Section>
  );
});
