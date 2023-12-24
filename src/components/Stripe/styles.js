const styles = theme => ({
  cardElementWrapper: {
    border: '1px solid #ccc',
    maxWidth: 400,
  },
  buttonWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    borderRadius: 40,
    borderWidth: 2,
    fontWeight: 600,
    boxShadow: 'none',
    textTransform: 'uppercase',
    minWidth: 130,
    display: 'inline-block',
    "&:not(:first-child)": {
      marginLeft: 5,
    },
    '& > .MuiButton-label': {
      display: 'inline-block',
      verticalAlign: 'sub',
    },
    "&:hover": {
      borderWidth: 2,
    },
    [theme.breakpoints.down('xs')]: {
      minWidth: 110,
    }
  },
  error: {
    fontSize: 12,
    color: '#f44336',
    textAlign: 'center',
  },
  paymentWrapper: {
    maxWidth: 400,
    margin: 'auto',
  },
  boxWrapper: {
    position: 'relative',
    textAlign: 'center',
  },
  boxDecorator: {
    backgroundColor: theme.colors.greyLight,
    position: 'absolute',
    height: 2,
    top: '45%',
    left: 0,
    right: 0,
  },
  boxText: {
    display: 'inline-block',
    position: 'relative',
    color: theme.colors.greyLight,
    padding: theme.spacing(0, 2),
    backgroundColor: theme.colors.white,
  },
});

export default styles;