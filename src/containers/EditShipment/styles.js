const styles = theme => ({
    container: {
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.black,
    },
    bodyContainer: {
        backgroundColor: theme.colors.greyNormal,
        padding: theme.spacing(7, 4),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(7, 2),
        }
    },
    boxWrapper: {
        backgroundColor: theme.colors.white,
    },
    sessionHeader: {
        border: '1px solid #eaeaea',
        borderRadius: '4px 4px 0 0',
        backgroundColor: theme.colors.greyishPurple,
        color: theme.palette.getContrastText(theme.colors.greyishPurple),
    },
    sessionHeaderTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.4rem',
        }
    },
    sessionBody: {
        border: '1px solid #eaeaea',
        backgroundColor: theme.colors.white,
    },
    sessionBodyTitle: {
        fontSize: '1.2rem',
        fontWeight: 700,
        textDecoration: 'underline',
    },
    editItemHeader: {
        fontSize: 14,
    },
    editItem: {
        backgroundColor: theme.colors.greyNormal,
        color: theme.colors.greyishLight,
        padding: theme.spacing(3),
        marginBottom: 10,
        '&:last-child': {
            marginBottom: 0,
        },
        '& strong': {
            color: theme.colors.black,
        },
        [theme.breakpoints.down('xs')]: {
            backgroundColor: 'transparent',
            padding: 0,
        }
    },
    deliveryWindowLabel: {
        fontSize: 13,
        // color: theme.colors.black,
    },
    locationMapWrapper: {
        paddingLeft: 20,
        [theme.breakpoints.down('xs')]: {
            paddingLeft: 0,
            marginTop: 10,
        }
    },
    locationMap: {
        height: "calc(100% - 50px)",
        [theme.breakpoints.down('xs')]: {
            height: 300,
        }
    },
    mapEdit: {
        backgroundColor: theme.colors.greyNormal,
        boxSizing: 'border-box',
        height: '100%',
        [theme.breakpoints.down('xs')]: {
            padding: 0,
            backgroundColor: 'transparent',
        }
    },
    dialogPaper: {
        overflowScrolling: "touch",
        WebkitOverflowScrolling: "touch",
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
        [theme.breakpoints.down('xs')]: {
            justifyContent: 'flex-end',
        }
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
        }
    },
    optButton: {
        width: '100%',
        textTransform: 'none',
    },
    titleBox: {
        [theme.breakpoints.down('xs')]: {
            paddingBottom: 0,
        }
    },
    dialogTitle: {
        fontSize: 24,
        color: theme.colors.black,
        [theme.breakpoints.down('xs')]: {
            textAlign: 'left',
            fontSize: 20,
            '& > h2': {
                fontSize: 16,
            }
        },
    },
    dialogBodyText: {
        [theme.breakpoints.down('xs')]: {
            textAlign: 'left',
        },
    },
    dialogTimer: {
        color: theme.colors.weaklessPurple,
    },
    timerCounter: {
        display: 'inline-block',
        marginLeft: 5,
        minWidth: 40,
    },
    noticeText: {
        fontStyle: 'italic',
        fontWeight: 600,
        lineHeight: 1.5,
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        }
    },
    noticeBox: {
        borderBottom: `1px solid ${theme.colors.greyLight}`,
        fontStyle: 'italic',
        fontWeight: 600,
        lineHeight: 1.5,
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        }
    },
    noticeSignatureBox: {
        borderBottom: `1px solid ${theme.colors.greyLight}`,
        fontStyle: 'italic',        
        lineHeight: 1.5,
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        }
    },
    infoBox: {
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        }
    },
    addressEdit: {
        [theme.breakpoints.down('xs')]: {
            '& .MuiGrid-grid-sm-10': {
                marginBottom: 20,
            }
        }
    },
    addressInputWrapper: {
        padding: theme.spacing(0, 2) + ' !important',
        [theme.breakpoints.down('xs')]: {
            padding: '0 !important',
        }
    },
    addressInput: {
        width: 400,
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        }
    },
    countdownTimer: {
        fontWeight: 600,
        marginLeft: 5,
        verticalAlign: 'middle',
    },
    shipmentDetails: {
        borderBottom: `1px solid #ccc`
    },
    shipmentDetailsContent: {
        '& > div:not(:last-child)': {
            [theme.breakpoints.down('xs')]: {
                marginBottom: 10,
            }
        },
    },
    inputField: {
        [theme.breakpoints.down('xs')]: {
            fontSize: 14,
        }
    },
    clientLogo: {
        width: theme.spacing(6),
        height: theme.spacing(6),
    },
    marginBottom: {
        marginBottom: 10,
    },
    grayText: {
        color: theme.colors.greyLight,
    },
    darkGrayText: {
        color: theme.colors.greyishLight,
    },
    redColor: {
        color: theme.colors.scarlet,
    },
    bolded: {
        fontWeight: 600,
    },
    underlined: {
        textDecoration: 'underline',
    },
    selfCenter: {
        alignSelf: 'center',
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        '& .MuiFormControlLabel-root.Mui-disabled': {
            cursor: 'not-allowed',
        }
    },
});

export default styles;