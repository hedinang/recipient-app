import React from 'react';
import { DialogActions, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '1rem 1.5rem',
    [theme.breakpoints.up('sm')]: {
      width: '240px',
      flexDirection: 'row-reverse',
    },
  },
}));

export default function DialogFooter({ children }) {
  const classes = useStyles();

  return <DialogActions className={classes.root}>{children}</DialogActions>;
}
