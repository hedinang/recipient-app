import React from 'react';
import { makeStyles } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const useStyles = makeStyles({
  title: {
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 0.5rem 0',
    color: '#5a5a5a',
    fontFamily: 'AvenirNext-Medium',
  },
  description: {
    marginTop: 0,
    fontSize: '14px',
    lineHeight: '1.5rem',
  },
});

export const Header = () => {
  const classes = useStyles();

  return (
    <>
      <h3 className={classes.title}>
        Delivery Details <ArrowDropDownIcon />
      </h3>
      <p className={classes.description}>While AxleHire will attempt to complete your delivery change requests, you will not be able to update the scheduled delivery date.</p>
    </>
  );
};
