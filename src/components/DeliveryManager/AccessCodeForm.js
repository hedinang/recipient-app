import React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Controller } from 'react-hook-form';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { TextField, Select, MenuItem, IconButton, Button, FormControl, FormHelperText, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  code: {
    color: '#707070',
    fontSize: '14px',
    fontFamily: 'AvenirNext-Medium',
  },
  form: {
    display: 'grid',
    gridAutoFlow: 'row',
    gap: '0.5rem',
    [theme.breakpoints.up('sm')]: {
      gridAutoFlow: 'column',
      gridTemplateColumns: '250px 1fr',
    },
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
}));

export const AccessCodeForm = compose(
  inject('store'),
  observer
)((props) => {
  const theme = useTheme();
  const classes = useStyles();
  const { store, styles, fields, append, remove, control, controlledAccessCodes, errors } = props;
  const { deliveryStore } = store;
  const data = deliveryStore?.accessCodeTypes || {};
  const options = Object.keys(data).map((type) => ({ type, code: data[type] }));
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));

  const selectedCodeTypes = controlledAccessCodes.map((field) => field.type).filter(Boolean);
  const messages = _.get(errors, 'access_code_map', []);

  if (options.length === 0) return null;

  return (
    <div style={styles}>
      {fields.map((_field, index) => (
        <div key={_field.id} className={classes.container}>
          <div className={classes.header}>
            <span className={classes.code}>Code #{index + 1}</span>
            {desktop === false && (
              <IconButton onClick={() => remove(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </div>
          <div className={classes.form}>
            <FormControl size="small" error={Boolean(_.get(messages[index], 'type'))}>
              <Controller
                control={control}
                rules={{ required: true }}
                name={`access_code_map.${index}.type`}
                render={({ field }) => (
                  <Select {...field} defaultValue="" error={Boolean(_.get(messages[index], 'type'))} fullWidth placeholder="Code Type" variant="outlined">
                    {options.map((item) => (
                      <MenuItem key={item.type} value={item.type} disabled={selectedCodeTypes.includes(item.type)}>
                        {item.code}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {Boolean(_.get(messages[index], 'type')) && <FormHelperText>This field is required</FormHelperText>}
            </FormControl>
            <FormControl size="small" error={Boolean(_.get(messages[index], 'code'))}>
              <Controller control={control} rules={{ required: true, pattern: /^[0-9*#]+$/ }} name={`access_code_map.${index}.code`} render={({ field }) => <TextField {...field} type="text" placeholder="Enter code here..." rows={2} fullWidth variant="outlined" size="small" error={Boolean(_.get(messages[index], 'code'))} />} />
              {Boolean(_.get(messages[index], 'code')) && <FormHelperText>{Boolean(_.get(messages[index], 'code')) ? (_.get(messages[index], 'code.type') === 'required' ? 'This field is required' : 'This field should contain numeric and special characters (include "*" or "#")') : ''}</FormHelperText>}
            </FormControl>
            {desktop && (
              <IconButton onClick={() => remove(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        </div>
      ))}
      {fields.length < options.length && (
        <Button className={classes.btn} variant="text" size="small" onClick={() => append({ type: '', code: '' })}>
          + Add new code
        </Button>
      )}
    </div>
  );
});
