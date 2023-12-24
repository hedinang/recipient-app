import React from 'react';
import { Box, Container } from '@material-ui/core';
import { withStyles } from '@material-ui/core';

import styles from './styles';
import AxleHireSupport from '../AxlSupport';
import DEFAULT_LOGO from '../../assets/svg/logo-alt.svg';

function Footer(props) {
  const { styles, classes, clientLogo, clientTitle, clientPhone, clientEmail, showAxlehireSupport, axlehireTitle, axlehireEmail, axlehirePhone } = props;

  return (
    <Container className={classes.footerContainer} style={styles}>
      <Box mx="auto" className={classes.footerWrapper}>
        <Box py={1} className={classes.footerHelp}>
          <Box style={{ fontSize: 20, fontWeight: 600 }}>Need help?</Box>
          <AxleHireSupport title={clientTitle} phone={clientPhone} email={clientEmail} />
          {showAxlehireSupport && <AxleHireSupport title={axlehireTitle} phone={axlehirePhone} email={axlehireEmail} />}
        </Box>
        <Box py={3}>
          <Box mb={2}>
            <img src={clientLogo || DEFAULT_LOGO} alt="AxleHire" className={classes.footerLogo} height={52} />
            {!clientLogo && <strong className={classes.footerBrand}>AxleHire</strong>}
          </Box>
          <Box>
            <span>© {new Date().getFullYear()}</span> <strong>AxleHire</strong>
            <span>. All rights reserved.</span>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default withStyles(styles)(Footer);
