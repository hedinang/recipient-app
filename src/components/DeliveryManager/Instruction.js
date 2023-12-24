import React from 'react';
import { get } from 'lodash';
import { FormControl, TextField } from '@material-ui/core';
import { Section } from './styled';

export const Instructions = React.forwardRef((props, ref) => {
  const { errors, ...rest } = props;
  const error = get(errors, 'delivery_instruction');

  return (
    <Section>
      <div className="section__header">
        <h4 className="section__title">Delivery Instructions:</h4>
      </div>
      <div className="section__body">
        <FormControl fullWidth>
          <TextField name="instruction" error={Boolean(error)} helperText={Boolean(error) ? 'This field should contain at least 3 characters' : ''} {...rest} ref={ref} fullWidth multiline rows={3} rowsMax={10} placeholder="Add instructions here..." variant="outlined" size="small" />
        </FormControl>
      </div>
    </Section>
  );
});
