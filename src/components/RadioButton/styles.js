const styles = theme => ({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    borderRadius: '50%',
    width: 16,
    height: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.greyLight,
  },
  checkedIcon: {
    backgroundColor: theme.colors.weaklessPurple,
    borderColor: theme.colors.weaklessPurple,
    '&:after': {
      content: '""',
      display: 'block',
      width: 10,
      height: 10,
      margin: 3,
      borderRadius: '50%',
      backgroundColor: theme.colors.white,
    }
  },
});

export default styles;