const styles = theme => ({
    logo: {
        padding: 10,
    },
    logoImg: {
        [theme.breakpoints.down('xs')]: {
            height: 40,
        },
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 7),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 200,
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    mainMenu: {
        listStyle: 'none',
        margin: 0,
        padding: '15px 2.5px',
        textAlign: 'right'
    },
    mainMenuItem: {
        fontFamily: 'AvenirNext-Italic',
        padding: '14px 25px',
        fontSize: '16px',
        lineHeight: '16px',
        display: 'inline-block',
        color: theme.colors.greyishBrown
    },
    mainMenuItemLink: {
        color: theme.colors.greyishBrown,
        fontFamily: 'AvenirNext-DemiBold',
        transition: 'all 0.3s ease 0s',
        textDecoration: 'none',
        '&:hover': {
            color: theme.colors.greyishLight,
        },
        '&.active': {
            color: theme.colors.weaklessPurple,
        }
    }
});

export default styles;