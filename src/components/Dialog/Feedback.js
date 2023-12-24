import React, { useEffect } from 'react';
import { Dialog, Slide, makeStyles } from '@material-ui/core';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const SCRIPT_SRC = process.env.REACT_APP_THUMBUP_FEEDBACK_WIDGET;
const SCRIPT_APP_URL = process.env.REACT_APP_THUMBUP_FEEDBACK_DATA_URL;

const useStyles = makeStyles({
  header: {
    display: 'flex',
    padding: '0 1rem',
    justifyContent: 'flex-end',
  },
  close: {
    border: 'none',
    fontWeight: 700,
    fontSize: '2rem',
    color: '#aeaeae',
    backgroundColor: 'transparent',
  },
});

function Feedback({ open, onCancel }) {
  const classes = useStyles();

  const injectWidget = () => {
    if (!SCRIPT_SRC) return;

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;

    document.body.appendChild(script);
  };

  useEffect(() => {
    injectWidget();

    return () => {
      const scripts = document.getElementsByTagName('script');

      for (let script of scripts) {
        if (script.src.includes('reviewmgr')) script.remove();
      }
    };
  }, []);

  return (
    <Dialog open={open} fullWidth maxWidth="sm" TransitionComponent={Transition} onClose={onCancel}>
      <div className={classes.header}>
        <button type="button" className={classes.close} onClick={onCancel}>
          &times;
        </button>
      </div>
      <div className="reviewmgr-embed" data-url={SCRIPT_APP_URL}></div>
    </Dialog>
  );
}

export default Feedback;
