import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { FormControl, IconButton, makeStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import { ImagesThumb } from 'containers/ManageDelivery/components';
import { Section } from './styled';

const useStyles = makeStyles({
  root: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    border: '1px dashed #979797',
    cursor: 'pointer',
  },
  text: {
    color: '#b7b6b7',
    fontSize: '14px',
    textAlign: 'center',
  },
  add: {
    fontSize: '14px',
    color: '#4a90e2',
    textAlign: 'center',
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    border: 'none',
    textDecoration: 'underline',
    textUnderlineOffset: '0.2rem',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    objectFit: 'cover',
    marginBottom: '0.5rem',
  },
});

export const DropoffPhoto = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const [images, setImages] = useState([]);
  const { onChange, value, ...rest } = props;

  const handleChange = (e) => {
    const data = [...images, { url: e.target.files[0] }];
    onChange(data);
    setImages(data);
  };

  const handleDeleteImage = () => {
    setImages([]);
    onChange([]);
  };

  const handleDeleteImageByIndex = (idx) => {
    const data = images.filter((_, index) => idx !== index);
    onChange(data);
    setImages(data);
  };

  useEffect(() => {
    if (value.length > 0 && _.some(value, (img) => typeof img === 'string')) {
      setImages(value.map((s) => ({ url: s })));
    }
  }, [value]);

  return (
    <Section>
      <div className="section__header">
        <h4 className="section__title section__title--no-margin section__title--h40">Preferred Drop-off:</h4>
        {images.length > 0 && (
          <IconButton onClick={handleDeleteImage}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </div>
      <div className="section__body">
        <FormControl fullWidth>
          <input type="file" ref={ref} {...rest} hidden id="attachment" accept="image/png, image/jpeg" onChange={handleChange} />
          {images.length ? (
            <>
              <div className="image">
                <ImagesThumb pods={images} title="Preferred Drop-off" onDelete={handleDeleteImageByIndex} />
              </div>
              <label htmlFor="attachment" className={classes.add}>
                + Add another photo
              </label>
            </>
          ) : (
            <div>
              <label htmlFor="attachment" className={classes.root}>
                <AddAPhotoIcon />
                <span className={classes.text}>Please share a photo of where our driver should leave your package...</span>
              </label>
            </div>
          )}
        </FormControl>
      </div>
    </Section>
  );
});
