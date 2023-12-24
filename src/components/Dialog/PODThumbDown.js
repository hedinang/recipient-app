import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Slide, makeStyles, Grid, DialogTitle } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { PREFER_POD } from 'constants/common';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    padding: '0 1rem',
    justifyContent: 'flex-end',
  },
  close: {
    border: 'none',
    fontWeight: 700,
    fontSize: '2rem',
    color: '#aeaeae',
    backgroundColor: 'transparent',
  },
  content: {
    padding: '24px',
    color: '#737273',
    lineHeight: '1.5em',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily,
  },
  title: {
    color: '#737273',
    textAlign: 'center',
  },
}));

const PODThumbDown = ({ handleClose, trackingCode }) => {
  const classes = useStyles();
  return (
    <div>
      <DialogTitle style={{ padding: '0 16px' }}>
        {handleClose && <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <ClearIcon style={{ cursor: 'pointer' }} onClick={handleClose} />
        </div>}
        <div className={classes.title}> Thank you for your feedback!</div>
      </DialogTitle>
      <Grid container alignItems="center" spacing={12}>
        <Grid item xs={12} className={classes.content}>
          <div>
            We're sorry that it was not a good delivery photo for you. Please proceed to our <Link to={`/${trackingCode}/edit?reason=${PREFER_POD}`}>Manage Delivery</Link> feature to upload example delivery photos for future deliveries.
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default PODThumbDown;
