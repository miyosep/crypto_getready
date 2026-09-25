import Image from "next/image";

type GuideImageProps = {
  filename: string;
  alt: string;
  sizes?: string;
};

export async function GuideImage({
  filename,
  alt,
  sizes = "(max-width: 740px) calc(100vw - 72px), 600px",
}: GuideImageProps) {
  const { default: image } = await import(`@/public/figures/${filename}`);

  return (
    <figure className="guide-image">
      <Image src={image} alt={alt} sizes={sizes} placeholder="blur" />
    </figure>
  );
}
