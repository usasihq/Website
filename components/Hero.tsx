import { preload } from "react-dom";
import { asset } from "@/lib/paths";

const WIDTHS = [640, 960, 1280, 1672];
const WIDTH = 1672;
const HEIGHT = 941;
// On desktop the artwork is capped at 46% of the viewport height (see .hero-figure),
// i.e. about 82vh wide; on smaller screens it spans the full width.
const SIZES = "(min-width: 1024px) 82vh, 100vw";

const srcSet = (ext: string) => WIDTHS.map((w) => `${asset(`/images/hero/hero-${w}.${ext}`)} ${w}w`).join(", ");

/**
 * The supplied branded artwork, shown intact at its native aspect ratio
 * (no text-free version was supplied, so the title lettering stays part of the
 * image and the live heading sits beneath it). On desktop its height is capped
 * so the heading, search, and both directory actions fit on the first screen;
 * it is never cropped or stretched. Only this above-the-fold image is
 * prioritized; dimensions are reserved to prevent layout shift.
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
    <figure className="hero-figure relative mx-auto w-full" aria-labelledby="hero-note">
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
      {/* Soft edges where the artwork meets the page whenever it is narrower than the window. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-bg to-transparent lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-bg to-transparent lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      <figcaption id="hero-note" className="relative -mt-2 px-4 text-right text-[0.8125rem] text-muted sm:px-6">
        Illustration only: the lights and arcs are artistic, not verified company locations, data centers, or network connections.
      </figcaption>
    </figure>
  );
}
