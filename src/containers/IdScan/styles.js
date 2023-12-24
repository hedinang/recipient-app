const styles = theme => ({
  container: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.black,
  },
  bodyContainer: {
    padding: theme.spacing(7, 4),
    backgroundColor: theme.colors.greyNormal,
  },
  statusContainer: {
      backgroundColor: theme.colors.greyishPurple,
      color: theme.colors.white,
      borderRadius: '4px 4px 0px 0px',
  },
  statusTitle: {
      display: "flex",
      justifyContent: 'space-between',
  },
  statusText: {
      fontSize: 15,
      marginRight: 5,
      verticalAlign: 'sub',
  },
  statusTextBig: {
      fontSize: 22,
      fontWeight: 600,
      verticalAlign: 'sub',
  },
  shipmentInfoContainer: {
    padding: theme.spacing(4.5),
    backgroundColor: theme.colors.white,
    [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(2)
    }
  },
  shipmentInfoLeft: {
      [theme.breakpoints.down('xs')]: {
          borderBottom: `1px solid ${theme.colors.greyLight}`,
          marginBottom: 20,
      }
  },
  shipmentInfoRight: {
      paddingLeft: 10,
      [theme.breakpoints.down('xs')]: {
          marginBottom: 20,
          paddingLeft: 0,
      }
  },
  contentText: {
    padding: '5px 0 0 0',
    marginBottom: 0
  },
  mainContent: {
    height: '100%',      
    // height: '-webkit-calc(100% - 50px)',
    // height: '-moz-calc(100% - 50px)',
    // height: 'calc(100% - 50px)'
  },
  canvasWrapper: {
    height: '100%'
  },
  canvas: {
    width: '100%',
    height: '100%'
    // width: 'calc(100% - 5px)',
    // height: 'calc(100% - 15px)',
    // // height: '300px',
    // border: '1px solid #cfcfcf',       
    // height: '-webkit-calc(100% - 50px)',
    // height: '-moz-calc(100% - 50px)',
    // height: 'calc(100% - 40px)',
  },
  button: {
    borderRadius: 40,
    textTransform: 'initial',
    borderWidth: 2,
    fontWeight: 600,
    boxShadow: 'none',
    display: "inline-block",
    '& > .MuiButton-label': {
        display: 'inline-block',
        verticalAlign: 'sub',
    },
    "&:hover": {
        borderWidth: 2,
    }
  },  
  scanButton: {
    width: '100%',
    color: '#fff',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    textTransform: 'none',
  },
  scanVisible: {
    backgroundColor: '#887fff',
    opacity: 0.25
  },
  submitScanButton: {
    width: '100%',
    color: '#fff',
    textTransform: 'none',
  },
  cantscanButton: {
    color: '#fff',    
    backgroundColor: '#a1b1c2',
    width: '100%',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    bottom: theme.spacing(2)
  },  
  clickSignatureLink: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex'
  },
  dialogActionsWrapper: {
    padding: theme.spacing(1, 3),
    justifyContent: 'flex-start',
    [theme.breakpoints.down('xs')]: {
        justifyContent: 'flex-end',
    }
  },
  signTitle: {
    fontWeight: 'bolder'
  },
  scanPreviewBox: {
    height: '200px',
    border: '1px solid #6c62f5',
    backgroundColor: '#f5f4ff',
    position: 'relative'
  },
  signatureImagePreview: {
    height: '100%',
    padding: '5px 0'
  },
  scanTipWrapper: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  scanTip: {
    color: '#444',
    paddingTop: theme.spacing(2),
    marginRight: theme.spacing(2),    
  },
  scanTipTitle: {
    fontSize: '14px',
    fontWeight: 'bolder'
  },
  scanTipDesc: {
    fontSize: '13px',
    fontWeight: 'normal',
    paddingTop: theme.spacing(1)
  }
});

export default styles;