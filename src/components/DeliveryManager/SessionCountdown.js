import React from 'react';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: '1rem 1.5rem',
    [theme.breakpoints.up('sm')]: {
      padding: '1rem 3rem',
    },
    backgroundColor: '#5b558e',
    color: '#fff',
    fontFamily: 'Azosans-Medium',
    borderRadius: '0.5rem 0.5rem 0 0',
  },
  heading: {
    marginTop: 0,
    fontSize: '24px',
  },
  description: {
    margin: 0,
    fontSize: '1rem',
    lineHeight: '1.5rem',
    color: '#f5f5ff',
    fontFamily: 'AvenirNext-Medium',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '1rem',
  },
  timer: {
    fontSize: '16px',
  },
  label: {
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  value: {
    paddingLeft: '2px',
  },
  cancel: {
    width: '120px',
    fontSize: '1rem',
    fontFamily: 'AvenirNext-Medium',
    borderRadius: '2rem',
    textTransform: 'inherit',
    backgroundColor: 'transparent',
  },
}));

export const SessionCountdown = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const { deliveryStore } = store;
  const { delivery, tokenRemainingTimeString } = deliveryStore;

  if (!delivery) return null;

  return (
    <div className={classes.container}>
      <h3 className={classes.heading}>Manage Your Delivery</h3>
      <p className={classes.description}>You have just entered Manage Delivery session, please update your delivery details before the session time expires!</p>
      <div className={classes.footer}>
        <div className={classes.timer}>
          <span className={classes.label}>Session time</span>:<span className={classes.value}>{tokenRemainingTimeString}</span>
        </div>
        <Button type="button" size="small" variant="outlined" color="inherit" disableElevation className={classes.cancel} onClick={() => deliveryStore.openExitSessionDialog()}>
          Exit session
        </Button>
      </div>
    </div>
  );
});
