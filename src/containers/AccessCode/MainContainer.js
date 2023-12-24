import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button, makeStyles } from '@material-ui/core';

import Feedback from 'components/Dialog/Feedback';
import ExitSession from 'components/Dialog/ExitSession';
import { Wrapper, Container } from './styled';
import { SessionCountdown, Overview, Header, DeliveryAddress, AccessCode, Instructions, DropoffPhoto, ExpiredToken, Backdrop } from 'components/DeliveryManager';

import api from 'utils/api';
import { getCookie } from 'utils/cookie';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: '2rem',
    fontWeight: 700,
    borderWidth: '2px !important',
    borderColor: '#6c62f5',
  },
  container: {
    color: '#5a5a5a',
    padding: '1rem 1.5rem',
    [theme.breakpoints.up('sm')]: {
      padding: '1rem 3rem',
    },
    border: '0.3px solid #aeaeae',
    borderTop: 'none',
    borderRadius: '0 0 0.5rem 0.5rem',
    backgroundColor: '#ffffff',
  },
  submit: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  redirect: {
    color: '#838383',
    fontSize: '14px',
    display: 'block',
    marginTop: '1rem',
    textAlign: 'center',

    '& > a': {
      color: '#4a90e2',
      padding: '0 2px',
    },
  },
  expired: {
    width: '200px',
    borderRadius: '2rem',
  },
}));

export const ManageDeliveryContainer = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const history = useHistory();
  const { trackingCode } = useParams();
  const [openDialog, setOpenDialog] = useState(false);

  const { handleSubmit, control, setValue, formState, watch } = useForm({ defaultValues: { access_code_map: [], delivery_instruction: '', image: [] }, shouldFocusError: true });
  const { fields, append, remove } = useFieldArray({ control, name: 'access_code_map' });
  const { deliveryStore } = store;
  const { token, delivery, loadingDelivery } = deliveryStore;
  const { access_code_map, preferred_photo, delivery_instruction } = delivery || {};

  const { errors } = formState;
  const watchAccessCodes = watch('access_code_map');
  const controlledAccessCodes = fields.map((field, index) => ({ ...field, ...watchAccessCodes[index] }));

  const onSubmit = (data) => {
    const accessCodeMap = data.access_code_map.map((item) => ({ [item.type]: item.code }));
    const filteredCode = _.merge({}, ...accessCodeMap);
    const access_code_map = Object.keys(filteredCode).length > 0 ? JSON.stringify(filteredCode) : '';

    let params = { ...data, access_code_map };
    params = _.omit(params, 'image');

    const formData = new FormData();
    for (const key in params) {
      formData.append(key, params[key]);
    }

    const uploadImages = data.image.filter((img) => img.url && typeof img.url !== 'string');
    const uploadedImages = data.image
      .filter((img) => typeof img.url === 'string')
      .map((img) => img.url.split('?')[0])
      .filter(Boolean);

    formData.append('image_urls', uploadedImages.toString());
    uploadImages.forEach((image) => formData.append('image', image.url));

    api.post(`delivery/${trackingCode}/${delivery.shipment.id}/update`, formData).then((response) => {
      if (response.status === 200) history.push(`/${trackingCode}/sessions/completed`);
    });
  };

  const handleConfirm = () => {
    setOpenDialog(true);
    api.post(`/delivery/${trackingCode}/${delivery.shipment.id}/confirm`);
  };

  useEffect(() => {
    const token = getCookie('axl_shipment_token');
    if (!token) return;

    deliveryStore.getTokenInfo(token, () => {
      deliveryStore.getDelivery(trackingCode, () => {
        deliveryStore.getAccessCodeTypes();
        deliveryStore.markManageDeliveryOpened();
      });
    });
  }, [deliveryStore, trackingCode]);

  useEffect(() => {
    if (access_code_map) {
      const codes = Object.keys(access_code_map)
        .map((type) => ({ type, code: access_code_map[type] }))
        .filter(({ code }) => Boolean(code));
      setValue('access_code_map', codes);
    }
    if (preferred_photo) setValue('image', preferred_photo);
    if (delivery_instruction) setValue('delivery_instruction', delivery_instruction);
  }, [append, access_code_map, preferred_photo, delivery_instruction, remove, setValue]);

  if (!token) return <ExpiredToken />;

  if (loadingDelivery) return <Backdrop />;

  return (
    <>
      <Wrapper>
        <Container>
          <SessionCountdown />
          <div className={classes.container}>
            <Overview />
            <div style={{ margin: '1.5rem 0', height: '1px', backgroundColor: '#cccccc' }} />
            <form onSubmit={handleSubmit(onSubmit)}>
              <Header />
              <DeliveryAddress />
              <AccessCode fields={fields} append={append} remove={remove} control={control} controlledAccessCodes={controlledAccessCodes} errors={errors} />
              <Controller name="delivery_instruction" control={control} rules={{ minLength: 3 }} render={({ field }) => <Instructions {...field} errors={errors} />} />
              <Controller name="image" control={control} render={({ field }) => <DropoffPhoto {...field} />} />
              <div className={classes.submit}>
                <Button type="submit" fullWidth variant="contained" color="primary" classes={{ root: classes.root }}>
                  Save
                </Button>
                <Button type="button" fullWidth variant="outlined" color="primary" classes={{ root: classes.root }} onClick={handleConfirm}>
                  This looks great!
                </Button>
              </div>
              <span className={classes.redirect}>
                Click <Link to={`/${trackingCode}/edit`}>here</Link> to access all Delivery Detail sections.
              </span>
            </form>
          </div>
        </Container>
        {openDialog && <Feedback open={openDialog} onCancel={() => setOpenDialog(false)} />}
        <ExitSession />
      </Wrapper>
    </>
  );
});
