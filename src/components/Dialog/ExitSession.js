import React from 'react';
import clsx from 'clsx';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { useParams, useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.black,
  },
  dialogPaper: {
    overflowScrolling: 'touch',
    WebkitOverflowScrolling: 'touch',
  },
  dialogTitle: {
    fontSize: 24,
    color: theme.colors.black,
    [theme.breakpoints.down('xs')]: {
      textAlign: 'left',
      fontSize: 20,
      '& > h2': {
        fontSize: 16,
      },
    },
  },
  darkGrayText: {
    color: theme.colors.greyishLight,
  },
  dialogBodyText: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'left',
    },
  },
  dialogActionsWrapper: {
    padding: theme.spacing(2, 3),
    justifyContent: 'flex-start',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-end',
    },
  },
  button: {
    borderRadius: 40,
    textTransform: 'initial',
    borderWidth: 2,
    fontWeight: 600,
    boxShadow: 'none',
    display: 'inline-block',
    '& > .MuiButton-label': {
      display: 'inline-block',
      verticalAlign: 'sub',
    },
    '&:hover': {
      borderWidth: 2,
    },
  },
  dialogButton: {
    textTransform: 'uppercase',
    minWidth: 130,
    display: 'inline-block',
    '& > .MuiButton-label': {
      display: 'inline-block',
      verticalAlign: 'sub',
    },
    [theme.breakpoints.down('xs')]: {
      minWidth: 110,
    },
  },
}));

const ExitSession = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const { trackingCode } = useParams();
  const history = useHistory();
  const { deliveryStore } = store;
  const { exitSessionDialog, tokenRemainingTime } = deliveryStore;

  const handleExitSession = () => {
    deliveryStore.exitSession(() => history.push(`/${trackingCode}`));
  };

  return (
    <Dialog open={exitSessionDialog || !tokenRemainingTime} onClose={() => deliveryStore.closeExitSessionDialog()} PaperProps={{ style: { padding: '24px 0', textAlign: 'center' }, className: clsx(classes.container, classes.dialogPaper) }} disableEscapeKeyDown={!tokenRemainingTime} disableBackdropClick={!tokenRemainingTime} maxWidth="sm" className={classes.container}>
      <DialogTitle className={classes.dialogTitle}>
        <strong>{!tokenRemainingTime ? 'Your token has expired!' : 'Manage Delivery Exit Confirmation'}</strong>
      </DialogTitle>
      <DialogContent>
        <Typography className={clsx(classes.darkGrayText, classes.dialogBodyText)}>
          You will need to go through verification again to start another Manage Delivery session.
          {!!tokenRemainingTime && ' Please confirm if you want to exit this current session!'}
        </Typography>
      </DialogContent>
      <DialogActions className={classes.dialogActionsWrapper} style={{ justifyContent: 'center' }}>
        {!!tokenRemainingTime && (
          <Button onClick={() => deliveryStore.closeExitSessionDialog()} variant="outlined" color="primary" className={clsx(classes.button, classes.dialogButton)}>
            CANCEL
          </Button>
        )}
        <Button onClick={handleExitSession} variant="contained" color="primary" className={clsx(classes.button, classes.dialogButton)}>
          EXIT
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ExitSession;
