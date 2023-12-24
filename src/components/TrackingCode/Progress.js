import React from 'react';
import clsx from 'clsx';
import { Box, Chip } from '@material-ui/core';
import { Close, Check } from '@material-ui/icons';

import * as SHIPMENT_STATUS from '../../constants/shipmentStatus';

function Progress(props) {
  const { mediaQuery, classes, shipment, progress, milestone } = props;

  return (
    <Box p={mediaQuery.isMobile ? 2 : 4.5} pb={mediaQuery.isMobile ? 3 : undefined} className={classes.statusContainer} borderRadius="10px 10px 0 0">
      <Box mb={2.5} className={classes.statusTitle}>
        <Box>
          <span className={classes.statusText}>Status: </span>
          <span className={classes.statusTextBig}>{milestone}</span>
        </Box>
        <Box>{shipment.attempt_count > 1 && <Chip size="small" className={classes.reattemptButton} label={'2nd attempt'} />}</Box>
      </Box>
      <Box className={classes.statusProgress} borderRadius={'11px'}>
        <Box className={clsx(classes.statusIndicator, classes.statusInProgress)} style={progress[milestone]}>
          {[SHIPMENT_STATUS.FAILED, SHIPMENT_STATUS.CANCELLED, SHIPMENT_STATUS.UNDELIVERABLE_SH].indexOf(milestone) > -1 ? <Close className={classes.whiteIcon} /> : <Check className={classes.whiteIcon} />}
        </Box>
      </Box>
    </Box>
  );
}

export default Progress;
