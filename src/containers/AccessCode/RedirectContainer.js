import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import { useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { get } from 'lodash';
import { CircularProgress } from '@material-ui/core';

import api from 'utils/api';
import { setCookie } from 'utils/cookie';
import { DAY_IN_MILLISECONDS } from 'constants/common';
import { ProgressContainer } from './styled';

export const RedirectManageDelivery = compose(
  inject('store'),
  observer
)((props) => {
  const { trackingCode } = useParams();
  const { location, history } = props;

  const searchParams = new URLSearchParams(location.search);
  const verifyCode = searchParams.get('code');
  const reason = searchParams.get('reason');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        const { data, status } = await api.get(`delivery/${trackingCode}`);
        if (status !== 200) throw new Error('Invalid tracking code');

        const shipmentID = get(data, 'shipment.id');
        const response = await api.post(`delivery/${trackingCode}/${shipmentID}/${verifyCode}/token?is_expired=false`);
        if (response.status !== 200) throw new Error('Invalid verify code');

        const token = response.data;
        const res = await api.get(`delivery/token/${token}`);
        const ttl = get(res, 'data.ttl', 0);
        setCookie('axl_shipment_token', token, ttl / DAY_IN_MILLISECONDS);

        if (reason) return history.push(`/${trackingCode}/edit?reason=${reason}`);

        history.push(`/${trackingCode}/sessions`);
      } catch (error) {
        setLoading(false);
        setError(error.message);
      }
    };

    fetchData();
  }, [history, reason, trackingCode, verifyCode]);

  return (
    <ProgressContainer>
      {error && <span>{error}</span>}
      {loading && <CircularProgress />}
    </ProgressContainer>
  );
});
