import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: '200px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  expired: {
    width: '200px',
    borderRadius: '2rem',
  },
});

export const ExpiredToken = () => {
  const classes = useStyles();
  const { trackingCode } = useParams();

  return (
    <div className={classes.root}>
      <p>No token found! Please redeem new one.</p>
      <Button className={classes.expired} variant="contained" color="primary" component={Link} to={`/${trackingCode}`} disableElevation>
        Ok
      </Button>
    </div>
  );
};
