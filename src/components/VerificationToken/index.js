import React, { useState } from 'react'
import { compose } from 'recompose'
import { inject, observer } from 'mobx-react'
import { useMediaQuery } from '@material-ui/core'

import DialogStepOne from 'components/TrackingCode/Dialogs/DialogStepOne'
import DialogStepThree from 'components/TrackingCode/Dialogs/DialogStepThree'
import DialogStepTwo from 'components/TrackingCode/Dialogs/DialogStepTwo'
import { VERIFICATION } from 'constants/verification'

const VerificationToken = compose(
  inject('store'),
  observer
)(({ store, closeDialog, setImages }) => {
  const [showDialogNext, setShowDialogNext] = useState(1);
  const [hasToken, setHasToken] = useState(false);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('xs'));

  const handleCloseDialog = () => {
    closeDialog();
    setShowDialogNext(0);
    store.deliveryStore.setCodeVerified();
    store.deliveryStore.setVerificationMethod(VERIFICATION.SMS)
    store.podStore.updateCurrentStep(0);
    store.podStore.updateIsRequested(false);
  }

  const handleNext = (v) => {
    setShowDialogNext(v);
    store.podStore.updateCurrentStep(v);
    if(v >= 3 && isMobile) {
      store.deliveryStore.getPOD((res) => {
        store.podStore.updateCurrentStep(4);
        setImages(res.data);
        store.podStore.setImagesPOD(res.data);
        store.deliveryStore.getPackageLocation();
        store.deliveryStore.getFeedback();
      })
    };
  }

  const handleClose = () => {
    store.podStore.updateCurrentStep(4);
  }

  return (
    <>
      {showDialogNext === 1 && <DialogStepOne handleClose={handleCloseDialog} handleNext={v => handleNext(v)}/>}
      {showDialogNext === 2 && <DialogStepTwo handleClose={handleCloseDialog} handleNext={v => handleNext(v)} setHasToken={(val) => setHasToken(val)}/>}
      {showDialogNext === 3 && !isMobile && <DialogStepThree handleClose={handleClose} isSuccess={hasToken} setImages={val => setImages(val)}/>}
    </>
  )
})

export default VerificationToken
