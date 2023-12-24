import React from 'react';
import { compose } from 'recompose';
import { observer, inject } from 'mobx-react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  session: {
    color: '#786df6',
    textDecoration: 'underline',
    fontFamily: 'AvenirNext',
  },
  timer: {
    color: '#786df6',
    paddingLeft: '4px',
    fontFamily: 'AvenirNext',
  },
});

export const SessionTime = compose(
  inject('store'),
  observer
)(({ store }) => {
  const classes = useStyles();
  const { deliveryStore } = store;
  const { delivery, tokenRemainingTimeString } = deliveryStore;

  if (!delivery) return null;

  return (
    <div>
      <span className={classes.session}>Session time:</span>
      <span className={classes.timer}>{tokenRemainingTimeString}</span>
    </div>
  );
});
