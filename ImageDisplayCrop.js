import React, { useState, useRef } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageDisplayCrop = ({ imageData, onProceedToTagging }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const onImageLoad = (e) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        16 / 9, // Default aspect ratio, you can change this
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop); // Set completedCrop initially as well
  };

  const getCroppedImage = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg'); // You can choose other formats like 'image/png'
    });
  };

  return (
    <div>
      <h2>Image Display and Crop</h2>
      {imageData && (
        <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={16 / 9}>
          <img ref={imgRef} alt="Image for cropping" src={imageData} onLoad={onImageLoad} />
        </ReactCrop>
      )}
      <button onClick={async () => {
        if (completedCrop && imgRef.current) {
          const croppedImageUrl = await getCroppedImage(imgRef.current, completedCrop);
          onProceedToTagging(croppedImageUrl);
        } else {
          onProceedToTagging(imageData); // Pass original image if no crop was made
        }
      }}>
        Proceed to Tagging
      </button>
    </div>
  );
};

export default ImageDisplayCrop;