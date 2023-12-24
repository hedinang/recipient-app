import { Box, Button, CircularProgress, DialogContent, Typography, withStyles } from '@material-ui/core';
import { CheckCircleOutline as CheckCircleOutlineIcon, HighlightOffOutlined as HighlightOffOutlinedIcon } from "@material-ui/icons";
import { inject, observer } from 'mobx-react';
import React, { Fragment, useState } from 'react';
import { compose } from 'recompose';
import withMediaQuery from '../../../constants/mediaQuery';
import styles from '../../../containers/main/styles';

function DialogStepThree({handleClose, isSuccess, store, setImages}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const handleGetPOD = () => {
        setIsSubmitting(true);
        try {
            store.deliveryStore.getPOD((res) => {
                setImages(res.data);
                store.podStore.setImagesPOD(res.data);
                store.deliveryStore.getPackageLocation();
                store.deliveryStore.getFeedback();
                handleClose()
            })
        } catch (error) {
            console.error(error)
        }
        finally {
            setIsSubmitting(false);
        }
    }
  return (
    <DialogContent style={{paddingBottom: '10px'}}>
        <Box style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <Box style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                {isSuccess ? (
                    <Fragment>
                        <CheckCircleOutlineIcon style={{color: '#4abc4e', fontSize: 50}}/> <Typography style={{fontSize: '30px', color: '#656465', fontWeight: '600', marginLeft: '8px'}}>Successfully Verified</Typography> 
                    </Fragment>
                ): (
                    <Fragment>
                        <HighlightOffOutlinedIcon color='error' style={{fontSize: 50}}/> <Typography style={{fontSize: '30px', color: '#656465', fontWeight: '600', marginLeft: '8px'}}>Error Verified</Typography>
                    </Fragment>
                )}
            </Box>
            <Box style={{marginTop: '50px'}}>
                <Button color={isSubmitting ? 'default' : 'primary'} size='medium' onClick={handleGetPOD} variant="contained" style={{width: '10rem', borderRadius: '25px', fontSize: '1rem'}}>
                    {isSubmitting && <CircularProgress /> }
                    {!isSubmitting && 'OK'}
                </Button>
            </Box>
        </Box>
    </DialogContent>
  )
}
const DialogStepThreeCompose = compose(inject('store'), observer)(DialogStepThree);

export default withStyles(styles)(withMediaQuery()(DialogStepThreeCompose));
