import React from 'react';
import { DialogTitle, makeStyles } from '@material-ui/core';
import { SessionTime } from 'components/DeliveryManager';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },
  heading: {
    margin: 0,
    color: '#656465',
    fontFamily: 'AvenirNext-Medium',
  },
}));

export default function DialogHeader({ title }) {
  const classes = useStyles();

  return (
    <DialogTitle disableTypography>
      <div className={classes.root}>
        <h3 className={classes.heading}>{title}</h3>
        <SessionTime />
      </div>
    </DialogTitle>
  );
}
