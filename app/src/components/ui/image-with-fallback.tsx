import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc?: string;
}

// This component is a wrapper around the next/image component that allows for a fallback image to be displayed in case the original image fails to load.
const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { fallbackSrc, src, alt, width = 32, height = 32, ...rest } = props;
  const defaultFallback = fallbackSrc || "/images/no-image.png";
  const [imgSrc, setImgSrc] = useState(src);

  if (!src || src === "") {
    return <Image src={defaultFallback} alt={alt} width={32} height={32} {...rest} />;
  }

  return (
    <Image
      {...rest}
      src={imgSrc}
      onError={() => {
        setImgSrc(defaultFallback);
      }}
      alt={alt}
      width={width}
      height={height}
    />
  );
};

export default ImageWithFallback;
