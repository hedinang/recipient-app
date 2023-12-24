import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControlLabel, withStyles } from '@material-ui/core';
import { CheckCircleOutline as CheckCircleOutlineIcon, Email as EmailIcon, HighlightOff as HighlightOffIcon, Smartphone as SmartPhoneIcon } from "@material-ui/icons";
import clsx from 'clsx';
import { inject, observer } from 'mobx-react';
import React, { Fragment, useState } from 'react';
import ReactCodeInput from 'react-verification-code-input';
import { compose } from 'recompose';
import withMediaQuery from '../../../constants/mediaQuery';
import { VERIFICATION } from '../../../constants/verification';
import styles from '../../../containers/main/styles';
import { setCookie } from '../../../utils/cookie';

function DialogStepTwo({handleClose, store, classes, mediaQuery, handleNext, setHasToken}) {
    const [data, setData] = useState({ policyAccepted: false, code: '' });
    const { delivery, verificationMethod, verifyingCode, codeVerified, dialogLoading } = store.deliveryStore;
    if (!delivery) return null;

    const {isRequested} = store.podStore;
    const { shipment } = delivery;
    const { policyAccepted } = data;

    const handleCodeInput = (value) => {
        store.deliveryStore.inputtingCode(value);
    };

    const resendCode = (e) => {
        e.preventDefault();
        store.deliveryStore.requestCode();
    };

    const changeVerificationMethod = (e) => {
        e.preventDefault();

        const newMethod = verificationMethod === 'sms' ? 'email' : 'sms';
        store.deliveryStore.setVerificationMethod(newMethod);
        store.deliveryStore.requestCode();
    };

    const handleNextStep = () => {
        store.deliveryStore.requestToken(store.deliveryStore.code,
        (res) => {
            if(setHasToken) {
              if (res.ok) setHasToken(true);
              else setHasToken(false);
            }
            setCookie("axl_shipment_token", store.deliveryStore.token, 0.003472);
            if (isRequested) store.deliveryStore.requestPOD();
            handleNext(3);
        });
    }

    return (
        <React.Fragment>
            <DialogTitle>
                {isRequested ? <strong>Request POD</strong> : <strong>Please help us to verify it's you</strong>}
            </DialogTitle>
            <DialogContent>
                <Box style={{color: '#707070'}}>
                    { verificationMethod === VERIFICATION.SMS ? (
                        <Fragment>
                            <span>
                                {`We sent a verification code in a SMS message via your phone ${shipment.customer.phone_number}`}
                            </span>
                            <SmartPhoneIcon style={{margin: '0px 4px -5px 4px'}}/>
                        </Fragment>

                    ) : (
                        <Fragment>
                            <span>
                                {`We sent a verification code via your email address ${shipment.customer.email}`}
                            </span>
                            <EmailIcon style={{margin: '0px 4px -5px 4px'}}/>
                        </Fragment>
                    )}
                </Box>
                <Box py={1} mt={3} mb={2}>
                    <strong >Enter verification code</strong>
                </Box>
                <Box>
                <Box>
                    {!dialogLoading ? (
                    <ReactCodeInput
                        type="number"
                        loading={verifyingCode}
                        autoFocus
                        fields={6}
                        fieldWidth={mediaQuery.isMobile ? 35 : undefined}
                        fieldHeight={mediaQuery.isMobile ? 35 : undefined}
                        className={clsx({
                        [classes.codeInput]: true,
                        [classes.codeOk]: !!codeVerified,
                        [classes.codeWrong]: codeVerified === false,
                        })}
                        onChange={handleCodeInput}
                        onComplete={() => store.deliveryStore.verifyCode((isVerified) => setData({ ...data, disableNext: !isVerified }))}
                    />
                    ) : (
                        <Box style={{ height: 60, padding: 2 }} /> // placeholder
                    )}
                    {!!codeVerified && <CheckCircleOutlineIcon className={clsx(classes.greenIcon, classes.codeStatusIcon)} />}
                    {codeVerified === false && <HighlightOffIcon className={clsx(classes.redIcon, classes.codeStatusIcon)} />}
                </Box>
                <ul style={{ paddingLeft: mediaQuery.isDesktop ? '16px' : '0px', listStyleType: 'none' }}>
                    <li className={clsx(classes.darkGrayText, classes.hint)}>
                        Don't receive your code? Click <a href="#code" onClick={(e) => resendCode(e)}>here</a> to send again!
                    </li>
                    {shipment.customer.phone_number && shipment.customer.email && (
                    <li className={clsx(classes.darkGrayText, classes.hint)} style={mediaQuery.isDesktop ? {display: 'flex', alignItems: 'center'} : {lineHeight: 1.5}}>
                        {verificationMethod === VERIFICATION.SMS ? (
                            <Fragment>
                                <span>
                                    {`Change verification method? Click `}
                                </span>
                                <a href="#method" onClick={(e) => changeVerificationMethod(e)} style={mediaQuery.isDesktop ? {margin: '0px 4px'} : null}>here</a>
                                <span>
                                    {` to send verification code via your email address ${shipment.customer.email} `}
                                </span>
                                <EmailIcon style={{margin: '0px 4px -5px 4px'}}/>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <span>
                                    {`Change verification method? Click `}
                                </span>
                                <a href="#method" onClick={(e) => changeVerificationMethod(e)} style={mediaQuery.isDesktop ? {margin: '0px 4px' } : {marginBottom: '-7px'}}>here</a>
                                <span>
                                    {` to send verification code in a SMS message via your phone ${shipment.customer.phone_number} `}
                                </span>
                                <SmartPhoneIcon style={{margin: '0px 4px -5px 4px'}}/>
                            </Fragment>
                        )}
                    </li>
                    )}
                </ul>
                </Box>
                <Box>
                    <FormControlLabel
                        control={<Checkbox checked={policyAccepted} onChange={(e) => setData({ ...data, policyAccepted: e.target.checked })} value="agreed_policy" color="primary" />}
                        label={
                        <span className={classes.darkGrayText}>
                            I agree to AxleHire's <a href="https://axlehire.com/privacy" target="_blank" rel="noopener noreferrer" style={{color: '#54a8ff'}}>Privacy Policy</a>
                        </span>
                        }
                    />
                </Box>
            </DialogContent>
            <DialogActions style={{justifyContent: 'flex-start', padding: '16px 24px'}}>
                <Button onClick={handleClose} color="primary" variant='outlined' style={{width: '10rem', borderRadius: '25px', fontSize: '1rem'}}>
                    Cancel
                </Button>
                <Button onClick={handleNextStep} color="primary" variant='contained' disabled={!codeVerified || !policyAccepted} style={{width: '10rem', borderRadius: '25px', fontSize: '1rem'}}>
                    Confirm
                </Button>
            </DialogActions>
        </React.Fragment>
    )
}

const DialogStepTwoCompose = compose(inject('store'), observer)(DialogStepTwo);

export default withStyles(styles)(withMediaQuery()(DialogStepTwoCompose));
