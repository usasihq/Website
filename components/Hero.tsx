import { preload } from "react-dom";
import { asset } from "@/lib/paths";

const WIDTHS = [640, 960, 1280, 1672];
const WIDTH = 1672;
const HEIGHT = 941;
// On desktop the artwork sits in the right column of the introduction (about
// 36rem wide); on smaller screens it spans the full width.
const SIZES = "(min-width: 1024px) 36rem, 100vw";

const srcSet = (ext: string) => WIDTHS.map((w) => `${asset(`/images/hero/hero-${w}.${ext}`)} ${w}w`).join(", ");

/**
 * The supplied branded artwork, shown intact at its native aspect ratio
 * (no text-free version was supplied, so the title lettering stays part of the
 * image and the live heading sits beside or beneath it). On desktop it is a
 * framed picture in the right column, so the heading, search, and both
 * directory actions fit on the first screen; on phones it runs edge to edge
 * above them. It is never cropped or stretched. Only this above-the-fold image
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
    <figure className="relative -mx-4 sm:-mx-6 lg:mx-0" aria-labelledby="hero-note">
      <div className="relative overflow-hidden lg:rounded-2xl lg:border lg:border-line-strong lg:shadow-hero">
        <picture>
          <source type="image/avif" srcSet={srcSet("avif")} sizes={SIZES} />
          <source type="image/webp" srcSet={srcSet("webp")} sizes={SIZES} />
          <img
            src={asset("/images/hero/hero-1280.jpg")}
            srcSet={srcSet("jpg")}
            sizes={SIZES}
            width={WIDTH}
            height={HEIGHT}
            alt="Artwork with the words “United States of America Superintelligence” and “American Super Intelligence, infrastructure, and innovation.” It shows Earth’s curvature at night, the Washington Monument and U.S. Capitol across the water, and a glowing network of lights and arcs over a map of the United States."
            fetchPriority="high"
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
        {/* On phones the artwork fades into the page below it. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-bg to-transparent lg:hidden" />
      </div>
      <figcaption id="hero-note" className="relative px-4 pt-1.5 text-center text-xs leading-snug text-muted sm:px-6 lg:px-0 lg:pt-3 lg:text-left">
        Illustration only: the lights and arcs are artistic, not verified company locations, data centers, or network connections.
      </figcaption>
    </figure>
  );
}
