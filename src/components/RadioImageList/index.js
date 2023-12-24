import { Grid, withStyles } from '@material-ui/core'
import React from 'react'
import clsx from 'clsx';

import RadioImage from 'components/RadioImage'
import withMediaQuery from 'constants/mediaQuery';
import styles from 'containers/main/styles';

function RadioImageList({data, title, handleChange, selectedValue, styles, classes, mediaQuery}) {
  if(data?.length <= 0) return;

  return (
    <>
      {title && 
        <Grid item xs={12} className={clsx({[classes.justifyContentCenter]: mediaQuery.isMobile}, {[classes.manageDeliveryInner]: mediaQuery.isMobile})}>
          <strong>{title}</strong>
        </Grid>
      }
      <Grid item container spacing={2} style={styles?.container}>
        {data.map((item, idx) => (
          <Grid item xs={4} md={2} key={idx}>
            <RadioImage
              imgUrl={item.src}
              inputID={item.imputID}
              inputName={item.imputName}
              value={item.value}
              title={item.title}
              handleChange={handleChange}
              selectedValue={selectedValue}
            />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default withStyles(styles)(withMediaQuery()(RadioImageList))
