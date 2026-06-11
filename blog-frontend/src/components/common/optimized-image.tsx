import Image, { type ImageProps } from "next/image";

type OptimizedImageProps = Omit<ImageProps, "loading"> & {
  eager?: boolean;
};

export function OptimizedImage({
  eager = false,
  sizes,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      {...props}
    />
  );
}
