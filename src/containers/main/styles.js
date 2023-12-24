const styles = (theme) => ({
  container: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.black,
  },
  nontouchBox: {
    fontSize: '0.8rem',
  },
  topAlertIcon: {
    position: 'relative',
    top: '2px',
    fontSize: '1rem',
  },
  topAlert: {
    borderRadius: 0,
    fontSize: '0.875rem',
    backgroundColor: '#eaa129',
    padding: theme.spacing(3, 4),
    color: '#fff',
    lineHeight: 1.5,
  },
  bodyContainer: {
    padding: theme.spacing(2, 4),
    backgroundColor: theme.colors.greyNormal,
  },
  boxWrapper: {
    border: '1px solid #eaeaea',
  },
  statusContainer: {
    backgroundColor: theme.colors.greyishPurple,
    color: theme.colors.white,
    borderRadius: '4px 4px 0px 0px',
  },
  statusTitle: {
    display: 'flex',
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
  reattemptButton: {
    color: theme.colors.greyishPurple,
    backgroundColor: theme.palette.getContrastText(theme.colors.greyishPurple),
  },
  statusProgress: {
    backgroundColor: theme.colors.white,
    position: 'relative',
    height: 8,
  },
  statusIndicator: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: theme.colors.babyPurple,
    color: theme.palette.getContrastText(theme.colors.babyPurple),
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  statusInProgress: {
    position: 'absolute',
    top: -11,
  },
  statusFailed: {
    backgroundColor: theme.colors.scarlet,
  },
  statusCompleted: {
    backgroundColor: theme.colors.leafyGreen,
  },
  shipmentInfoContainer: {
    padding: theme.spacing(4.5),
    backgroundColor: theme.colors.white,
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
  shipmentInfoLeft: {
    [theme.breakpoints.down('xs')]: {
      borderBottom: `1px solid ${theme.colors.greyLight}`,
      marginBottom: 20,
    },
  },
  shipmentInfoRight: {
    paddingLeft: 10,
    [theme.breakpoints.down('xs')]: {
      marginBottom: 20,
      paddingLeft: 0,
    },
  },
  eventsAndMap: {
    [theme.breakpoints.up('xs')]: {
      flexDirection: 'row-reverse',
    },
  },
  button: {
    borderRadius: 40,
    textTransform: 'initial',
    borderWidth: 2,
    fontWeight: 600,
    boxShadow: 'none',
    display: 'inline-block',
    '& > .MuiButton-label': {
      display: 'inline-block',
      verticalAlign: 'sub',
    },
    '&:hover': {
      borderWidth: 2,
    },
  },
  tipButton: {
    marginLeft: 5,
    marginTop: 0,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginTop: 10,
    },
  },
  hideSmall: {
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  showSmall: {
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  clientLogo: {
    width: 50,
    height: 50,
  },
  clientName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  grayText: {
    color: theme.colors.greyLight,
  },
  darkGrayText: {
    color: theme.colors.greyishLight,
    verticalAlign: 'sub',
  },
  grayTextWithMarginBtm: {
    color: theme.colors.greyLight,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 600,
  },
  dialogButton: {
    textTransform: 'uppercase',
    minWidth: 130,
    display: 'inline-block',
    '& > .MuiButton-label': {
      display: 'inline-block',
      verticalAlign: 'sub',
    },
    [theme.breakpoints.down('xs')]: {
      minWidth: 110,
    },
  },
  bodyItemWrapper: {
    [theme.breakpoints.down('xs')]: {
      '&:first-child > .MuiContainer-root': {
        borderBottom: 'none',
      },
      '&:last-child > .MuiContainer-root': {
        borderTop: 'none',
      },
    },
  },
  bodyBottomItem: {
    backgroundColor: theme.colors.white,
    padding: 20,
    height: '100%',
    maxHeight: 610,
    overflow: 'auto',
    [theme.breakpoints.down('xs')]: {
      maxHeight: 'unset',
    },
  },
  manageDeliveryContainer: {
    border: '1px solid #ccc',
    [theme.breakpoints.down('xs')]: {
      fontSize: 13,
    },
  },
  manageDeliveryInner: {
    textAlign: 'center',
  },
  manageDeliveryLeft: {
    backgroundImage: theme.manageDeliveryLeft.backgroundImage,
    color: theme.manageDeliveryLeft.color,
    display: theme.manageDeliveryLeft.display,
    alignItems: theme.manageDeliveryLeft.alignItems,
    justifyContent: theme.manageDeliveryLeft.justifyContent,
  },
  mdTitle: {
    fontSize: '1.2em',
    fontWeight: 900,
  },
  mdItem: {
    verticalAlign: 'middle',
    marginRight: 5,
  },
  whiteIcon: {
    color: theme.colors.white,
    marginTop: 2,
  },
  greenIcon: {
    color: theme.colors.leafyGreen,
  },
  redIcon: {
    color: theme.colors.scarlet,
  },
  inlineIcon: {
    verticalAlign: 'middle',
    margin: '0 5px',
  },
  deliveryStep: {
    flexWrap: 'nowrap',
    padding: '20px 0',
    fontSize: 15,
    color: theme.colors.greyishLight,
    '&:first-child': {
      color: theme.colors.black,
      fontWeight: 600
    },
  },
  deliveryStepCell: {
    padding: '0 20px',
  },
  deliveryStepCellDateTime: {
    textAlign: 'right',
    maxWidth: 100,
    [theme.breakpoints.down('sm')]: {
      padding: '0 10px 0 0',
    },
  },
  deliveryStepDate: {
    fontSize: 14,
    fontWeight: 600,
  },
  deliveryStepTime: {
    fontSize: 10,
  },
  deliveryStepCellIcon: {
    paddingLeft: 2,
  },
  deliveryStepConnector: {
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      left: 13,
      width: 8,
      minHeight: 'calc(100% + 10px)',
      backgroundColor: 'rgba(204, 204, 204, 0.4)',
    },
  },
  dialogPaper: {
    overflowScrolling: 'touch',
    WebkitOverflowScrolling: 'touch',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
  },
  dialogOverlayProgress: {
    position: 'absolute',
    top: '45%',
    left: '45%',
  },
  dialogMethodSelectTitle: {
    borderBottom: `1px solid #ccc`,
    borderBottomColor: theme.colors.greyLight,
  },
  dialogActionsWrapper: {
    padding: theme.spacing(2, 3),
    justifyContent: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 32,
    },
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-end',
      marginBottom: 45,
    },
  },
  radioGroup: {
    '& .MuiFormControlLabel-root': {
      display: 'block',
    },
    '& .MuiFormControlLabel-root .MuiFormControlLabel-label': {
      width: 'calc(100% - 40px)',
      display: 'inline-block',
    },
    '& .MuiFormControlLabel-root .MuiFormControlLabel-label > div': {
      display: 'block',
    },
  },
  radioLabelWrapper: {
    [theme.breakpoints.down('xs')]: {
      marginRight: 0,
      '&:not(:last-child)': {
        marginBottom: 20,
      },
      '& .MuiFormControlLabel-label': {
        width: '100%',
      },
    },
  },
  radioLabel: {
    [theme.breakpoints.down('xs')]: {
      display: 'inline-block',
      padding: theme.spacing(2),
      backgroundColor: '#f4f3ff',
      borderRadius: 4,
    },
  },
  radioLabelWithColor: {
    padding: theme.spacing(2),
    backgroundColor: '#f4f3ff',
    borderRadius: 4,
  },
  codeInput: {
    width: 'fit-content !important',
    display: 'inline-block',
    '& > div > input': {
      border: 'none !important',
      borderBottom: '2px solid #ccc !important',
      borderRadius: '0 !important',
      margin: 5,
      fontSize: 40,
      [theme.breakpoints.down('xs')]: {
        fontSize: 20,
      },
    },
  },
  codeOk: {
    '& > div > input': {
      color: `${theme.colors.leafyGreen} !important`,
      borderColor: `${theme.colors.leafyGreen} !important`,
    },
  },
  codeWrong: {
    '& > div > input': {
      color: `${theme.colors.scarlet} !important`,
      borderColor: `${theme.colors.scarlet} !important`,
    },
  },
  codeStatusIcon: {
    [theme.breakpoints.down('xs')]: {
      verticalAlign: 'sub',
    },
  },
  lastDialogText: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
  },
  hint: {
    fontSize: 14,
    marginBottom: 10,
  },
  feedbackTitleContainer: {
    padding: theme.spacing(0, 3),
  },
  feedbackTitle: {
    position: 'relative',
    [theme.breakpoints.down('xs')]: {
      borderBottom: `1px solid ${theme.colors.greyLight}`,
    },
  },
  feedbackTitleNoBottom: {
    position: 'relative',
  },
  feedbackContainer: {
    color: '#8d8d8d',
    // [theme.breakpoints.down('xs')]: {
    //     minWidth: 'unset',
    // }
  },
  feedbackInput: {
    backgroundColor: theme.colors.greyNormal,
  },
  feedbackSubmittedTime: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'right',
    },
  },
  selfCenter: {
    alignSelf: 'center',
  },
  separator: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    '&:after': {
      content: '',
      flex: 1,
      borderBottom: '1px solid #000',
      marginLeft: '.25em',
    },
    '&:before': {
      content: '',
      flex: 1,
      borderBottom: '1px solid #000',
      marginRight: '.25em',
    },
  },
  tippingTitleContainer: {
    padding: theme.spacing(0, 3),
  },
  tippingTitle: {
    position: 'relative',
  },
  tippingHeader: {
    // [theme.breakpoints.down('xs')]: {
      display: 'inline-block',
      marginRight: 40,
    // }
  },
  dialogCloseButton: {
    zIndex: 2,
    position: 'absolute',
    top: -15,
    right: -20,
    [theme.breakpoints.down('xs')]: {
      top: 0,
    }
  },
  emailLabelWrapper: {
    minHeight: 41,
  },
  sendEmailWrapper: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'right',
    },
  },
  sendEmailBtn: {
    color: theme.palette.primary.main,
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(1),
    },
  },
  sendEmailSuccess: {
    color: theme.palette.success.main,
  },
  underline: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  arrowIcon: {
    verticalAlign: 'bottom',
  },
  justifyContentCenter: {
    display: 'flex',
    justifyContent: 'center'
  },
  rootDialogContent: {
    overflow: 'hidden',
  }
});

export default styles;
