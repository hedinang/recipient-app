import React from 'react';
import { Box } from '@material-ui/core';

function FAQ(props) {
  const url = process.env.REACT_APP_FAQ_URL;
  if (!url) return;
   const {store} = props;
   const {pageTheme} = store.deliveryStore;
  return (
    <Box py={1} style={{ fontSize: pageTheme.faqFirst.fontSize, fontFamily: pageTheme.faqFirst.fontFamily }}>
      <span style={{ color: pageTheme.faqSecond.color, fontFamily: pageTheme.faqSecond.fontFamily }}>Got questions? </span>Visit our FAQs at{' '}
      <a href={url} style={{ color: pageTheme.faqUrl.color }} target="_blank" rel="noopener noreferrer">
        {url}
      </a>{' '}
      to learn more about the delivery process
    </Box>
  );
}

export default FAQ;
