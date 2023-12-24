const homeStyles = theme => ({
  container: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.black,
  },
  bodyContainer: {
    padding: theme.spacing(0),
    backgroundColor: theme.colors.greyNormal,
  },
  mainContainer: {
    position: 'relative',
  },
  mainBackground: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  mainForm: {
    width: 1200,
    margin: 'auto',
    height: 300,
    maxHeight: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      width: '100%',
      margin: 0,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  },
  mainFormInner: {
    width: 700,
    maxWidth: 'calc(100% - 50px)',
    padding: theme.spacing(3, 2),
    margin: 'auto 0px auto 25px',
    opacity: 0.81,
    backgroundColor: '#393060',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      width: '100%',
      margin: 0,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  },
  mainFormTitle: {
    fontFamily: 'AzoSans-Bold',
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: '1.3em',
    letterSpacing: 1.17,
    color: theme.colors.white,
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      fontSize: 25,
      textAlign: 'center',
    },
  },
  mainFormSubTitle: {
    fontFamily: 'AzoSans',
    fontSize: 23,
    lineHeight: '1.3em',
    letterSpacing: 0.9,
    color: theme.colors.white,
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
      textAlign: 'center',
      margin: theme.spacing(0, 0, 2),
    },
  },
  formInputWrapper: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  formInputInner: {
    flex: 1,
  },
  formInput: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(0.5),
  },
  submitBtn: {
    padding: theme.spacing(2, 4)
  }
});

export default homeStyles;