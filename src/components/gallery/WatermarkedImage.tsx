import { watermarkedUrl, cleanUrl } from "@/lib/cloudinary";

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
  const url = unwatermarked ? cleanUrl(src, width) : watermarkedUrl(src, width);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt || ""} className={className} loading="lazy" />;
}
