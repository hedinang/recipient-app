import React, { useEffect } from 'react';
import { compose } from 'recompose';
import { useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Grid, makeStyles } from '@material-ui/core';

import ExitSessionDialog from 'components/Dialog/ExitSession';

import LocationDialog from './Dialog/LocationDialog';
import AccessCodeDialog from './Dialog/AccessCodeDialog';
import PreferPhotoDialog from './Dialog/PreferPhotoDialog';
import InstructionDialog from './Dialog/InstructionDialog';
import AddressDialog from './Dialog/AddressDialog';
import SessionNoticeDialog from './Dialog/SessionNoticeDialog';
import { AddressQuestionnaire, AccessCode, DeliveryInstruction, Location, DeliveryPhoto, DeliveryAddress } from './components';
import { SessionCountdown, Overview, Header, ExpiredToken, Backdrop, Hr } from 'components/DeliveryManager';
import FooterContainer from 'components/Footer/FooterContainer';

import { getCookie } from 'utils/cookie';
import useSearchParams from 'hooks/useSearchParams';
import { ACCESS_CODE, INVALID_ACCESS_CODE, NO_ACCESS_CODE, GATED_ADDRESS, ADDRESS_NOT_ACCESSIBLE, ADDRESS_QUESTIONNAIRE, ADDRESS, PREFER_POD, DELIVERY_PREFER_POD, DELIVERY_INSTRUCTION, DELIVERY_ADDRESS, QUESTIONNAIRE_PROPERTIES } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '1rem',
    fontFamily: 'AvenirNext',
    maxWidth: '1280px',
    margin: '0 auto',
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
  section: {
    display: 'grid',
    gridAutoFlow: 'row',
    gap: '1rem',
    marginBottom: '1rem',
    [theme.breakpoints.up('sm')]: {
      gridAutoFlow: 'column',
      gridTemplateColumns: '1fr 1fr',
    }
  }
}));

export const ManageDelivery = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const [searchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery, token } = deliveryStore;

  const reason = searchParams.get('reason');
  const skip = searchParams.get('skip_questionnaire');
  const dialogStatus = searchParams.get('dialog');

  const questionnaire = delivery?.['recipient-questionnaire'];
  const completed = typeof questionnaire === 'object' && QUESTIONNAIRE_PROPERTIES.every((property) => questionnaire.hasOwnProperty(property));
  const show = completed || skip === 'skipped';

  const accessCodeReasons = [ACCESS_CODE, INVALID_ACCESS_CODE, NO_ACCESS_CODE, GATED_ADDRESS];
  const addressReasons = [ADDRESS, ADDRESS_NOT_ACCESSIBLE, ADDRESS_QUESTIONNAIRE];
  const preferDropoffPhotoReasons = [PREFER_POD, DELIVERY_PREFER_POD];

  const renderDialogs = () => {
    if (dialogStatus === 'closed') return;

    if (accessCodeReasons.includes(reason)) return <AccessCodeDialog />;
    if (addressReasons.includes(reason)) return <LocationDialog />;
    if (preferDropoffPhotoReasons.includes(reason)) return <PreferPhotoDialog />;
    if (reason === DELIVERY_INSTRUCTION) return <InstructionDialog />;
    if (reason === DELIVERY_ADDRESS) return <AddressDialog />;
  };

  useEffect(() => {
    const token = getCookie('axl_shipment_token');
    if (!token) return;

    deliveryStore.getTokenInfo(token, (response) => {
      if (response.status !== 200) return;

      deliveryStore.getDelivery(trackingCode, () => {
        deliveryStore.markManageDeliveryOpened();
      });
      deliveryStore.getAccessCodeTypes();
      deliveryStore.getAddressTypes();
    });
  }, [deliveryStore, trackingCode]);

  if (!token) return <ExpiredToken />;

  if (!delivery) return <Backdrop />;

  return (
    <>
      <div className={classes.root}>
        <SessionCountdown />
        <div className={classes.container}>
          <Overview />
          <Hr />
          <Grid>
            <Grid>
              <AddressQuestionnaire />
            </Grid>
            {show && (
              <>
                <Grid>
                  <Header />
                </Grid>
                <div className={classes.section}>
                  <Grid>
                    <DeliveryAddress />
                  </Grid>
                  <Grid>
                    <AccessCode />
                  </Grid>
                </div>
                <Grid>
                  <DeliveryInstruction />
                </Grid>
                <Grid>
                  <Location />
                </Grid>
                <Grid>
                  <DeliveryPhoto />
                </Grid>
              </>
            )}
          </Grid>
        </div>
        {renderDialogs()}
        <ExitSessionDialog />
        <SessionNoticeDialog />
      </div>
      <FooterContainer />
    </>
  );
});
