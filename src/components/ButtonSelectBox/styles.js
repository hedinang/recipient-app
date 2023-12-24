const styles = theme => ({
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
  optButton: {
      width: '100%',
      textTransform: 'none',
  }
});

export default styles;