import React, { useEffect } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, Button, makeStyles } from '@material-ui/core';

import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import useSearchParams from 'hooks/useSearchParams';
import { AccessCodeForm, Hr } from 'components/DeliveryManager';
import api from 'utils/api';
import { NO_ACCESS_CODE, INVALID_ACCESS_CODE, GATED_ADDRESS, ACCESS_CODE } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'AvenirNext',
  },
  title: {
    paddingBottom: 0,
  },
  heading: {
    marginTop: 0,
    color: '#656465',
    fontFamily: 'AvenirNext-Medium',
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    marginTop: 0,
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
}));

const AccessCodeDialog = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { handleSubmit, control, setValue, formState, watch } = useForm({ defaultValues: { access_code_map: [] }, shouldFocusError: true });
  const { fields, append, remove } = useFieldArray({ control, name: 'access_code_map' });
  const { errors } = formState;

  const watchAccessCodes = watch('access_code_map');
  const controlledAccessCodes = fields.map((field, index) => ({ ...field, ...watchAccessCodes[index] }));

  const reason = searchParams.get('reason');
  const skipQuestions = searchParams.get('skip_questionnaire');

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const accessCodeMap = delivery?.access_code_map;
  const filteredCodes = Object.keys(accessCodeMap || {})
    .map((type) => ({ type, code: accessCodeMap[type] }))
    .filter(({ code }) => Boolean(code));

  const onSubmit = (data) => {
    const access_codes = data.access_code_map;
    const access_code_map = _.merge({}, ...access_codes.map((item) => ({ [item.type]: item.code })));

    const formData = new FormData();
    formData.append('access_code_map', JSON.stringify(access_code_map));
    api.post(`delivery/${trackingCode}/${delivery.shipment.id}/update`, formData).then((response) => {
      if (response.status !== 200) return toast.error(<span className={classes.notice}>Something went wrong. Please try again!</span>, { theme: 'colored', hideProgressBar: true });
      deliveryStore.getDelivery(trackingCode);
      handleCancel();
    });
  };

  const handleCancel = () => {
    searchParams.set('dialog', 'closed');

    if (!skipQuestions) searchParams.set('skip_questionnaire', 'skippable');
    setSearchParams(searchParams);
  };

  const renderTitle = () => {
    if (reason === NO_ACCESS_CODE) return 'Unsuccessful Delivery - No Access Code';
    if (reason === INVALID_ACCESS_CODE) return 'Unsuccessful Delivery - Wrong Access Code';
    if (reason === GATED_ADDRESS) return 'Gated Address - Codes';
    if (reason === ACCESS_CODE) return 'Codes';

    return '';
  };

  const renderText = () => {
    if (reason === NO_ACCESS_CODE || reason === INVALID_ACCESS_CODE) return "We're sorry that we could not deliver your previous shipment. Please add your access code below. You can also cancel and edit your codes later.";
    if (reason === GATED_ADDRESS) return _.isEmpty(filteredCodes) ? 'Please share the access codes required to deliver to this address. If no codes are required, click Cancel. You can still edit your codes later in our Codes section.' : 'Please confirm if provided access codes are correct. In case you click on Cancel, you can still edit your codes later in our Codes section.';
    if (reason === ACCESS_CODE) return 'While AxleHire will attempt to complete your delivery change requests, you will not be able to update the scheduled delivery date.';

    return '';
  };

  useEffect(() => {
    if (_.isEmpty(accessCodeMap)) return;

    const codes = Object.keys(accessCodeMap)
      .map((type) => ({ type, code: accessCodeMap[type] }))
      .filter(({ code }) => Boolean(code));
    setValue('access_code_map', codes);
  }, [accessCodeMap, setValue]);

  return (
    <Dialog open maxWidth="md" fullWidth className={classes.root}>
      <DialogHeader title={renderTitle()} />
      <DialogContent>
        <p className={classes.text}>{renderText()}</p>
        {reason === ACCESS_CODE && (
          <>
            <Hr />
            <p className={classes.text}>Let us know if there are codes to access your address.</p>
          </>
        )}
        <AccessCodeForm fields={fields} append={append} remove={remove} control={control} controlledAccessCodes={controlledAccessCodes} errors={errors} />
      </DialogContent>
      <DialogFooter>
        <Button disabled={!_.isEmpty(errors)} onClick={handleSubmit(onSubmit)} fullWidth className={classes.btn} size="medium" color="primary" variant="contained" disableElevation>
          Save
        </Button>
        <Button onClick={handleCancel} fullWidth className={classes.btn} size="medium" color="primary" variant="outlined" disableElevation>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
});

export default AccessCodeDialog;
