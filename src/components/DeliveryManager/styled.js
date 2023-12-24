import { Button, styled } from '@material-ui/core';

export const Section = styled('div')({
  padding: '1rem',
  backgroundColor: '#f8f9f8',
  marginBottom: '1rem',
  height: '100%',
  width: '100%',
  boxSizing: 'border-box',

  '& .section__header': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  '& .section__title': {
    color: '#0f0c1b',
    fontSize: '16px',
    fontWeight: 700,
    marginTop: 0,

    '&--no-margin': {
      margin: 0,
    },

    '&--h40': {
      minHeight: '40px',
    },
  },

  '& .section__body': {},
});

export const Heading = styled('h3')({
  display: 'flex',
  alignItems: 'center',
  margin: '0 0 0.5rem 0',
  color: '#5a5a5a',
  fontFamily: 'AvenirNext-Medium',
  textUnderlineOffset: '0.3rem',
});

export const EditButton = styled(Button)({
  lineHeight: 1.2,
  fontSize: '12px',
  textTransform: 'unset',
  borderRadius: '2rem',
});

export const Hr = styled('div')({
  margin: '1rem 0',
  height: '1px',
  backgroundColor: '#cccccc',
});
