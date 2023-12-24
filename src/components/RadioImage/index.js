import { Box, withStyles } from '@material-ui/core';
import React from 'react'

import styles from './styles';
const svgDir = require.context('../../assets/svg/feedback-icon/');

function RadioImage({title, inputID, inputName, value, imgUrl, imgAlt, classes, styles, handleChange, selectedValue, positionLabel, textStyle})  {
  const getStyles = (postion) => {
    switch (postion) {
      case 'top':
        return {
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'center',
        }

      case 'left':
        return {
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'center',
        }

      case 'right':
        return {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }
    
      default:
        return {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }
    }
  }

  let svgIcon = svgDir(`./thumb-default.svg`);  
  try {
    svgIcon = svgDir(`./${imgUrl}.svg`)
  } catch (error) {
    svgIcon = svgDir(`./thumb-default.svg`);
  }

  return (
    <Box className={classes.crSelector} style={getStyles(positionLabel)}>
        <input id={inputID} type="radio" name={inputName} value={value} onChange={handleChange} checked={selectedValue == value}/>
          <label className={selectedValue && classes.crLabelImg} htmlFor={inputID}>
            <img
              alt={imgAlt}
              width={styles?.imgWidth || "70"}
              height={styles?.imgHeight || "70"}
              src={svgIcon}
            />
          </label>
          <label className={classes.crTitle} style={textStyle} htmlFor={inputID}>{title}</label>
    </Box>
  )
}

export default withStyles(styles)(RadioImage);
