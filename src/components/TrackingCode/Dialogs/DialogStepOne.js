import { Box, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, Radio, RadioGroup, Typography, useMediaQuery, withStyles } from '@material-ui/core';
import { Email as EmailIcon, Smartphone as SmartPhoneIcon } from "@material-ui/icons";
import { inject, observer } from 'mobx-react';
import React from 'react';
import { compose } from 'recompose';
import withMediaQuery from '../../../constants/mediaQuery';
import styles from '../../../containers/main/styles';

function DialogStepOne({handleClose, store, handleNext, mediaQuery}) {
    const { delivery, verificationMethod } = store.deliveryStore;
    if (!delivery) return null;

    const { shipment } = delivery;
    !shipment?.customer?.phone_number && shipment?.customer?.email && store.deliveryStore.setVerificationMethod('email');

    const {isRequested} = store.podStore;

    const handleChange = (e) => {
        if (!e.target || !e.target.value) return;

        store.deliveryStore.setVerificationMethod(e.target.value);
    }

    const handleNextStep = () => {
        store.deliveryStore.requestCode()
        handleNext(2);
    }

    return (
        <React.Fragment>
             {isRequested ? <DialogTitle>Request POD</DialogTitle> : <DialogTitle>Please help us to verify it's you</DialogTitle>}
            <DialogContent>
                <DialogContentText>
                    We will send a verification code to your preferred means of contact to make sure it's you!
                </DialogContentText>
                <Typography variant='h6' style={{fontWeight: 600, marginTop: '25px', marginBottom: '8px'}}>Select a verification method</Typography>
                <Divider />
                <FormControl component="fieldset" style={{marginTop: '8px'}}>
                    <RadioGroup name='verificationMethod' value={verificationMethod} onChange={handleChange}>
                        {!shipment?.customer?.phone_number && !shipment?.customer?.email && 'Not found your email or phone number'}
                        {shipment?.customer?.phone_number && <Box style={{display: 'flex', alignItems: 'center'}}>
                            <Radio color='primary' value='sms'/>
                            <Box style={ mediaQuery.isMobile ? {backgroundColor: '#f4f3ff', padding: '0.5rem'} : null}>
                                <span style={{lineHeight: 1.5, color: '#707070'}}>{`Receive a verification code in an SMS message via your phone ${shipment?.customer?.phone_number}`}</span>
                                <SmartPhoneIcon style={{color: '#707070', marginBottom: '-5px'}}/>
                            </Box>
                        </Box>}
                        {shipment?.customer?.email && <Box style={{display: 'flex', alignItems: 'center', marginTop: '8px'}}>
                            <Radio color='primary' value='email'/>
                            <Box style={mediaQuery.isMobile ? {backgroundColor: '#f4f3ff', padding: '0.5rem'} : null}>
                                <span style={{lineHeight: 1.5, color: '#707070'}}>{`Receive a verification code via your email address ${shipment?.customer?.email}`}</span>
                                <EmailIcon style={{color: '#707070', margin: '0px 4px -5px 4px'}}/>
                            </Box>
                        </Box>}
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions style={{justifyContent: 'flex-start', padding: '16px 24px'}}>
                <Button onClick={handleClose} color="primary" variant='outlined' style={{width: '10rem', borderRadius: '25px', fontSize: '1rem'}}>
                    Cancel
                </Button>
                <Button onClick={handleNextStep} color="primary" variant='contained' style={{width: '10rem', borderRadius: '25px', fontSize: '1rem'}}>
                    Next
                </Button>
            </DialogActions>
        </React.Fragment>
    )
}

const DialogStepOneCompose = compose(inject('store'), observer)(DialogStepOne);

export default withStyles(styles)(withMediaQuery()(DialogStepOneCompose));
