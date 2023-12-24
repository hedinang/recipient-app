import React from 'react';
import clsx from 'clsx';
import { Dialog, Box, CircularProgress } from '@material-ui/core';

import DialogTip from './DialogTip';
import DialogStepOne from './DialogStepOne';
import DialogStepTwo from './DialogStepTwo';
import DialogStepLast from './DialogStepLast';
import DialogFeedback from './DialogFeedback';

function MainDialog(props) {
  const { open, loading, step, classes, mediaQuery, closeDialog } = props;

  const renderDialogContent = () => {
    const dialogProps = { closeDialog };
    switch (step) {
      case 1: {
        return <DialogStepOne {...dialogProps} />;
      }

      case 2: {
        return <DialogStepTwo {...dialogProps} />;
      }

      case 3: {
        return <DialogStepLast {...dialogProps} />;
      }

      case 4: {
        return <DialogFeedback {...dialogProps} />;
      }

      case 5: {
        return <DialogTip {...dialogProps} />;
      }

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => closeDialog()}
      PaperProps={{
        style: { padding: '16px 0' },
        className: clsx(classes.container, classes.dialogPaper),
      }}
      maxWidth="md"
      fullScreen={mediaQuery.isMobile}
      disableBackdropClick
      disableEscapeKeyDown
      className={classes.container}
      fullWidth
    >
      {loading && (
        <Box className={classes.dialogOverlay}>
          <CircularProgress className={classes.dialogOverlayProgress} color="primary" />
        </Box>
      )}
      {renderDialogContent()}
    </Dialog>
  );
}

export default MainDialog;
