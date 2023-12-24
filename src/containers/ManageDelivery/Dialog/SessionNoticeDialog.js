import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    fontFamily: 'AvenirNext',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'AvenirNext-Medium',
    color: '#5b5b5b',
    marginBottom: 0,
  },
  text: {
    color: '#868686',
    fontFamily: 'AvenirNext-Medium',
  },
  actions: {
    justifyContent: 'center',
  },
  button: {
    minWidth: '120px',
    borderRadius: '2rem',
    fontFamily: 'AvenirNext-Medium',
  },
});

export default function SessionNoticeDialog() {
  const classes = useStyles();
  const [openDialog, setOpenDialog] = useState(true);

  const handleClose = () => setOpenDialog(false);

  return (
    <Dialog maxWidth="md" open={openDialog} onClose={handleClose} className={classes.root}>
      <DialogTitle disableTypography>
        <h3 className={classes.title}>Your session will end soon!</h3>
      </DialogTitle>
      <DialogContent>
        <Typography className={classes.text}>Please make your requests within the session time before it runs out.</Typography>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={handleClose} variant="contained" color="primary" className={classes.button} disableElevation>
          Got It
        </Button>
      </DialogActions>
    </Dialog>
  );
}
