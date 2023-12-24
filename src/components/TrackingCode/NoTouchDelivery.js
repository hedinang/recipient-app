import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, Typography, Divider, IconButton } from '@material-ui/core';

import { Warning, Close } from '@material-ui/icons';

function NoTouchDelivery(props) {
  const { classes } = props;
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Box className={classes.topAlert}>
      <Warning className={classes.topAlertIcon} />
      With the current situation around COVID-19, AxleHire's priority is the safety of you and our drivers. We have created the <strong>No-Touch Attended Deliveries</strong> feature for our deliveries.
      Click <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setOpenDialog(true)}>here</span> to view the procedure in detail.
      <br />
      <br />
      If you want the delivery left at the door, please go into "Manage Delivery" and change your preferences in the "Signature option" section.
      <Dialog open={openDialog}>
        <IconButton onClick={() => setOpenDialog(false)} style={{ position: 'absolute', top: 0, right: 0, color: '#BEBFC0', padding: '5px' }}>
          <Close />
        </IconButton>
        <DialogTitle>
          No-Touch Attended Delivery
          <Divider style={{ marginTop: '8px' }} />
        </DialogTitle>
        <DialogContent>
          <Typography style={{ fontSize: '0.84rem', color: '#5a5a5a', fontWeight: 'bolder', lineHeight: 2.0 }}>Here is what the no-touch attended delivery procedure will look like:</Typography>
          <Typography style={{ fontSize: '0.84rem', color: '#5a5a5a', lineHeight: 1.5 }}>
            <ul>
              <li>You have the option of signing at any point after the order has been picked up from the facility via the “Provide Signature” button on the tracking link.</li>
            </ul>
          </Typography>
          <ul>
            <li style={{ listStyle: 'none' }}>
              <hr class="hr-text" data-content="OR" />
            </li>
          </ul>

          <Typography style={{ fontSize: '0.84rem', color: '#5a5a5a', lineHeight: 1.5, paddingBottom: '25px' }}>
            <ul>
              <li>Once the driver arrives at your delivery location, they will place the shipment near the door.</li>
              <li>They will take a few steps back and send you a signature request via SMS.</li>
              <li>You will be sent a unique link where you can sign for the delivery on your own device.</li>
              <li>You may stay indoors or open the door to check your delivery, whatever is more comfortable for you.</li>
              <li>Once you save the signature, the driver will receive it and the delivery is complete.</li>
            </ul>
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default NoTouchDelivery;
