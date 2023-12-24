const styles = theme => ({
  footerContainer: {
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.paleGrey,
  },
  footerWrapper: {
    padding: theme.spacing(4),
    maxWidth: 500,
    textAlign: 'center',
  },
  footerHelp: {
    borderBottom: '1px solid #ccc',
    borderColor: theme.colors.paleGrey,
  },
  footerLogo: {
    verticalAlign: 'middle',
    margin: '0 10px',
  },
  footerBrand: {
    fontSize: theme.spacing(3),
    verticalAlign: 'middle',
  },
});

export default styles;