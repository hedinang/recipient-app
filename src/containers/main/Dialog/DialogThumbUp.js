import React, { useEffect } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import trustpilot from '../../../assets/images/trustpilot.svg';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { useParams } from 'react-router-dom';

import api from 'utils/api';

const trustpilotReviewUrl = 'https://www.trustpilot.com/evaluate/axlehire.com';

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 'bold',
  },
  text: {
    marginTop: 15,
    textAlign: 'center',
  },
  logo: {
    width: '110px',
  },
}));

function ThumbUpFeedback({ thumbValue, store }) {
  const classes = useStyles();
  const { tracking_code } = useParams();

  const isValidConfig = process.env.REACT_APP_THUMBUP_FEEDBACK_WIDGET && process.env.REACT_APP_THUMBUP_FEEDBACK_DATA_URL;

  const injectWidget = () => {
    if (!process.env.REACT_APP_THUMBUP_FEEDBACK_WIDGET) return;

    const script = document.createElement('script');
    script.src = process.env.REACT_APP_THUMBUP_FEEDBACK_WIDGET;

    document.body.appendChild(script);
  };

  useEffect(() => {
    injectWidget();
    store.deliveryStore.updateField('isSubmittedFeedback', false);
    if(store.podStore.isPODFeedback) {
      store.deliveryStore.updateField('lastStep', true);
    }
    api.get(`delivery/${tracking_code}`).then(res => store.deliveryStore.updateField('delivery', res.data))

    return () => {
      const scripts = document.getElementsByTagName('script');

      for (let script of scripts) {
        if (script.src.includes('reviewmgr')) script.remove();
      }
    };
  }, []);

  return (
    <>
      {thumbValue && isValidConfig ? (
        <div className="reviewmgr-embed" data-url={process.env.REACT_APP_THUMBUP_FEEDBACK_DATA_URL}></div>
      ) : (
        <>
          <Typography variant="h6" align="center" className={classes.title}>
            Thank you for your feedback!
          </Typography>
          {thumbValue ? (
            <>
            <Typography className={classes.text}>We invite you to leave an external review for us. Please click below!</Typography>
            <div className={classes.text}>
              <a href={trustpilotReviewUrl} target="_blank" rel="noopener noreferrer">
                <img className={classes.logo} src={trustpilot} alt="Trust Pilot" />
              </a>
            </div>
          </>
          ) : (
            <div className={classes.text}>We appreciate your feedback to help us improve!</div>
          )}
        </>
      )}
    </>
  )
}

const ThumbUpFeedbackCompose = compose(inject('store'), observer)(ThumbUpFeedback);
export default ThumbUpFeedbackCompose;
