import React from 'react';
import { makeStyles } from '@material-ui/core';

import { Section } from './styled';
import { AccessCodeForm } from './AccessCodeForm';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '14px',
  },
});

export const AccessCode = (props) => {
  const classes = useStyles();
  const { fields, append, remove, control, controlledAccessCodes, errors } = props;

  return (
    <Section>
      <div className="section__header">
        <p className="section__title">Codes:</p>
      </div>
      <div className="section__body">
        <div className={classes.container}>
          <AccessCodeForm fields={fields} append={append} remove={remove} control={control} controlledAccessCodes={controlledAccessCodes} errors={errors} />
        </div>
      </div>
    </Section>
  );
};
