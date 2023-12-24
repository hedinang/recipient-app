import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import PreviewImage from 'components/PreviewImage';

const useStyles = makeStyles((theme) => ({
  image: {
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    objectFit: 'cover',
    maxHeight: '350px',
  },
  imageMoreWrap: {
    position: 'relative',
    cursor: 'pointer',
    height: '100%',
    width: '100%',
  },
  imageNumber: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.2rem',
    color: 'white',
    zIndex: 1,
    cursor: 'pointer',
    fontFamily: 'AvenirNext-Medium',
  },
  container: {
    display: 'grid',
    minHeight: '120px',
    gridAutoFlow: 'row',
    gridTemplateColumns: 'repeat(3, minmax(80px, 1fr))',
    gap: '5px',
    maxHeight: '350px',
    alignItems: 'start',
  },
}));

export const ImagesThumb = ({ pods, title, style, limitPhotos, onDelete }) => {
  const classes = useStyles();
  const [isPreview, setIsPreview] = useState(false);
  const imageRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const limit = typeof limitPhotos === 'number' ? limitPhotos : 2;

  const handlePreviewImage = (idx) => {
    setIsPreview(true);
    setCurrentSlide(idx);
    setTimeout(() => {
      if (imageRef.current) imageRef.current.slickGoTo(idx);
    }, 0);
  };

  const handleClosePreview = () => {
    setIsPreview(false);
  };

  return (
    <div className={classes.container} style={style}>
      {pods?.map((m, idx) => {
        if (idx < limit) {
          return <img alt="" src={typeof m.url === 'string' ? m.url : URL.createObjectURL(m.url)} className={classes.image} key={`image-${idx}`} onClick={() => handlePreviewImage(idx)} />;
        }
        if (idx === limit) {
          return (
            <div className={classes.imageMoreWrap} key={`image-${idx}`} onClick={() => handlePreviewImage(idx)}>
              {pods.length - limit - 1 > 0 && <span className={classes.imageNumber}>+{pods.length - limit}</span>}
              <img alt="" src={typeof m.url === 'string' ? m.url : URL.createObjectURL(m.url)} className={classes.image} style={{ filter: pods.length - 3 > 0 ? 'brightness(0.7) opacity(50%)' : '', WebkitFilter: pods.length - 3 > 0 ? 'brightness(0.7) opacity(50%)' : '', flex: '0 0 100%' }} />
            </div>
          );
        }
      })}
      {title && <PreviewImage textTitle={title} isPreview={isPreview} images={pods} imageRef={imageRef} handleClosePreview={handleClosePreview} deliveryStore={{}} setImages={() => {}} currentSlide={currentSlide} setCurrentSlide={(v) => setCurrentSlide(v)} onDelete={onDelete} />}
    </div>
  );
};
