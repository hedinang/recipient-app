import React from 'react'
import _ from 'lodash';

import RadioImageList from 'components/RadioImageList';
import { dataThumbDown } from 'constants/thumbs';


function PreselectThumbDown({handleChange, selectedValue, styles, negativeFeedbacks}) {
  const newIcons = negativeFeedbacks?.split(',')?.map(item => {
    const splitByAtSign = item?.split('@');
    return {
      src: splitByAtSign?.[1],
      title: splitByAtSign?.[0],
      imputID: splitByAtSign?.[0]?.toLowerCase()?.replace(/\s/g, '_'),
      imputName: 'icon-thumb-down',
      value: splitByAtSign?.[0],
    }
  }) || [];

  const groups = Object.entries(_.groupBy([...dataThumbDown, ...newIcons], 'src'))?.map(([k, values]) => ({
    src: values?.[0]?.src,
    title: values?.map(v => v.title)?.join("/"),
    imputID: values?.[0]?.imputID,
    imputName: values?.[0]?.imputName,
    value: values?.map(v => v.value)?.join("/"),
  })) || [];

  return (
    <RadioImageList 
      data={groups} 
      title='Let us know the reason!' 
      handleChange={handleChange} 
      selectedValue={selectedValue}
      styles={styles}
    />
  )
}

export default PreselectThumbDown
