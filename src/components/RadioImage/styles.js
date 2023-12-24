const styles = theme => ({
  'crSelector': {
    '& input': {
      margin:0,
      padding:0,
      WebkitAppearance:'none',
      MozAppearance:'none',
      appearance:'none',
    },

    '&:hover': {
      color: '#000',
      cursor: 'pointer',
    },

    '&:hover img, &:hover label': {
      cursor: 'pointer',
    },

    '& input:not(:checked) + label': {
      WebkitFilter: 'opacity(.7)',
      MozFilter: 'opacity(.7)',
      filter: 'opacity(.7)',
    },
    '& input:not(:checked):hover + label': {
      WebkitFilter: 'opacity(1)',
      MozFilter: 'opacity(1)',
      filter: 'opacity(1)',
    },

    '& input:checked ~ label': {
      fontWeight: 'bold',
      color: '#000'
    }
  },
  'crLabelImg': {
    cursor:'pointer',
    backgroundSize:'contain',
    backgroundRepeat: 'no-repeat',
    display: 'inline-block',
    WebkitTransition: 'all 100ms ease-in',
    MozTransition: 'all 100ms ease-in',
    transition: 'all 100ms ease-in',
  },
  'crTitle': {
    textAlign: 'center',
    color: 'inherit',
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.8rem',
    },
  }
});

export default styles;
