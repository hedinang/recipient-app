import React from 'react';
import { get } from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core';

import { Section, EditButton } from 'components/DeliveryManager';

import { ACCESS_CODE, APARTMENT_COMPLEX, COMMERCIAL_BUILDING, NO_ACCESS_CODE, INVALID_ACCESS_CODE } from 'constants/common';
import useSearchParams from 'hooks/useSearchParams';

const useStyles = makeStyles({
  code: {
    fontSize: '14px',
    fontFamily: 'AvenirNext',
  },
  empty: {
    fontSize: '14px',
    fontStyle: 'italic',
    fontFamily: 'AvenirNext',
  },
  notice: {
    margin: 0,
    color: '#f5a623',
    fontSize: '13px',
    fontStyle: 'italic',
    fontFamily: 'AvenirNext',
  },
});

export const AccessCode = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const accessCodeMap = delivery?.access_code_map || {};
  const accessCodeTypes = deliveryStore?.accessCodeTypes || {};
  const addressType = get(delivery, 'recipient-questionnaire.address_type');
  const codes = Object.keys(accessCodeMap)
    .map((type) => ({ label: accessCodeTypes[type], value: accessCodeMap[type] }))
    .filter(({ label, value }) => Boolean(label) && Boolean(value));

  const notice = [APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(addressType);
  const reason = searchParams.get('reason');
  const highlight = [NO_ACCESS_CODE, INVALID_ACCESS_CODE].includes(reason);

  const handleOpenDialog = () => {
    searchParams.delete('dialog');
    searchParams.set('reason', ACCESS_CODE);
    setSearchParams(searchParams);
  };

  return (
    <Section style={highlight ? { border: '1px solid #6c62f5' } : {}}>
      <div className="section__header">
        <span className="section__title">Codes:</span>
        <EditButton size="small" variant="outlined" color="primary" onClick={handleOpenDialog}>
          Edit
        </EditButton>
      </div>
      <div className="section__body">
        {codes.length === 0 ? (
          <p className={classes.empty} onClick={handleOpenDialog}>
            Add code here...
          </p>
        ) : (
          codes.map((item) => (
            <p key={item.label} className={classes.code}>
              {item.label}: {item.value}
            </p>
          ))
        )}
        {codes.length === 0 && notice && <p className={classes.notice}>*Let us know if there's any codes to access your gated address</p>}
      </div>
    </Section>
  );
});
