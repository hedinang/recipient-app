const styles = theme => ({
  title: {
    lineHeight: 1.5,
  },
  iconButton: {
    backgroundColor: theme.colors.white,
    border: '1px solid green',
    borderColor: theme.colors.lime,
    margin: theme.spacing(0, 1),
    boxShadow: '0 0.5px 1.5px 0 rgba(0, 0, 0, 0.2)',
    [theme.breakpoints.down('xs')]: {
      borderRadius: 4,
      display: 'block',
      marginBottom: 10,
      padding: theme.spacing(1.5),
      width: 250,
      margin: 'auto',
    }
  },
  icon: {
    color: theme.colors.greyishLight,
    marginTop: 2,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    }
  },
  text: {
    display: 'none',
    [theme.breakpoints.down('xs')]: {
      display: 'block',
      textTransform: 'uppercase',
      fontWeight: 800,
      fontSize: 13,
      color: '#2d414e',
    }
  },
});

export default styles;