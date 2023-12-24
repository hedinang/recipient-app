import React from 'react';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Button, makeStyles } from '@material-ui/core';

import useSearchParams from 'hooks/useSearchParams';
import { QUESTIONNAIRE_PROPERTIES } from 'constants/common';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1rem 0',
  },
  btn: {
    color: '#4a90e2',
    textDecoration: 'underline',
    textUnderlineOffset: '0.2rem',
    textTransform: 'inherit',

    '&:hover': {
      textDecoration: 'underline',
      backgroundColor: 'transparent',
    },
  },
});

function AddressQuestionnaireButton({ store }) {
  const classes = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();

  const { deliveryStore } = store;
  const { delivery } = deliveryStore;
  const data = delivery?.['recipient-questionnaire'];
  const doing = typeof data === 'object' && QUESTIONNAIRE_PROPERTIES.some((property) => data.hasOwnProperty(property));
  const option = searchParams.get('skip_questionnaire');

  const handleSkipQuestionnaire = () => {
    if (option === 'skipped') searchParams.set('skip_questionnaire', 'doing');
    if (option === 'skippable') searchParams.set('skip_questionnaire', 'skipped');

    setSearchParams(searchParams);
  };

  if (doing || !option) return null;

  return (
    <div className={classes.root}>
      <Button className={classes.btn} variant="text" color="primary" size="small" onClick={handleSkipQuestionnaire}>
        {option === 'skipped' && 'Take Questionnaire'}
        {option === 'skippable' && 'Do Questionnaire Later'}
      </Button>
    </div>
  );
}

export default compose(inject('store'), observer)(AddressQuestionnaireButton);
