import React from 'react'
import RadioImageList from 'components/RadioImageList';
import { dataThumbUp } from 'constants/thumbs';

function PreselectThumbUp({handleChange, selectedValue, styles}) {

  return (
    <RadioImageList 
      data={dataThumbUp} 
      title='Share a compliment!' 
      handleChange={handleChange} 
      selectedValue={selectedValue}
      styles={styles}
    />
  )
}

export default PreselectThumbUp
