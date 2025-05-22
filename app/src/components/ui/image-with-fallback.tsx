import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

type ImageWithFallbackProps = ImageProps;

// This component is a wrapper around the next/image component that allows for a fallback image to be displayed in case the original image fails to load.
const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { src, alt, width = 32, height = 32, ...rest } = props;
  const [error, setError] = useState(false);

  const renderAvatarFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 text-sm font-semibold">
      {alt
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );

  if (!src || src === "" || error) {
    return renderAvatarFallback();
  }

  return (
    <Image
      {...rest}
      src={src}
      onError={() => {
        setError(true);
      }}
      alt={alt}
      width={width}
      height={height}
    />
  );
};

export default ImageWithFallback;
