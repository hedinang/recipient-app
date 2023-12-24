import { styled } from '@material-ui/core/styles';

export const ProgressContainer = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  placeContent: 'center',
  height: '100%',
  zIndex: -1,
});

export const Wrapper = styled('div')({});

export const Container = styled('div')({
  fontFamily: 'Azosans',
  backgroundColor: '#fafafa',
  maxWidth: '1280px',
  margin: '0 auto',
  boxSizing: 'border-box',
  padding: '1rem',

  '@media (min-width: 768px)': {
    padding: '3rem 2rem',
  },
});

export const BlankContainer = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  paddingTop: '200px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});
