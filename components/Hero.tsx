import { preload } from "react-dom";
import { asset } from "@/lib/paths";

const WIDTHS = [640, 960, 1280, 1672];
const WIDTH = 1672;
const HEIGHT = 941;
const SIZES = "(min-width: 1672px) 1672px, 100vw";

const srcSet = (ext: string) => WIDTHS.map((w) => `${asset(`/images/hero/hero-${w}.${ext}`)} ${w}w`).join(", ");

/**
 * The supplied branded artwork, shown intact at its native aspect ratio
 * (no text-free version was supplied, so the title lettering stays part of the
 * image and the live heading sits beneath it). Only this above-the-fold image
 * is prioritized; dimensions are reserved to prevent layout shift.
 */
export function Hero() {
  preload(asset("/images/hero/hero-1280.avif"), {
    as: "image",
    type: "image/avif",
    imageSrcSet: srcSet("avif"),
    imageSizes: SIZES,
    fetchPriority: "high",
  });

  return (
    <figure className="relative mx-auto w-full max-w-[1672px]" aria-labelledby="hero-note">
      <picture>
        <source type="image/avif" srcSet={srcSet("avif")} sizes={SIZES} />
        <source type="image/webp" srcSet={srcSet("webp")} sizes={SIZES} />
        <img
          src={asset("/images/hero/hero-1280.jpg")}
          srcSet={srcSet("jpg")}
          sizes={SIZES}
          width={WIDTH}
          height={HEIGHT}
          alt="Artwork with the words “United States of America Superintelligence” and “American AI, infrastructure, and innovation.” It shows Earth’s curvature at night, the Washington Monument and U.S. Capitol across the water, and a glowing network of lights and arcs over a map of the United States."
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>
      {/* Soft edges where the artwork meets the page on very wide screens. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-bg to-transparent min-[1700px]:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-bg to-transparent min-[1700px]:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      <figcaption id="hero-note" className="container-page relative -mt-2 text-right text-[0.8125rem] text-muted">
        Illustration only: the lights and arcs are artistic, not verified company locations, data centers, or network connections.
      </figcaption>
    </figure>
  );
}
