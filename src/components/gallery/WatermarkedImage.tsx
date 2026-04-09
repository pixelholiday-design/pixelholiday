import { watermarkedUrl, cleanUrl, isSignedCloudinaryUrl } from "@/lib/cloudinary";

export function WatermarkedImage({
  src,
  alt,
  width = 1200,
  unwatermarked = false,
  className,
}: {
  src: string;
  alt?: string;
  width?: number;
  unwatermarked?: boolean;
  className?: string;
}) {
  // If already a signed URL, pass through (don't re-transform)
  const url = isSignedCloudinaryUrl(src)
    ? src
    : unwatermarked
      ? cleanUrl(src, width)
      : watermarkedUrl(src, width);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt || ""} className={className} loading="lazy" />;
}
