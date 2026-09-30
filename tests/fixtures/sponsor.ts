import type { HomepageSponsorConfig } from "@/lib/site-config";

/** Synthetic test-only advertisement. Never included in production configuration. */
export const sponsorFixture: HomepageSponsorConfig = {
  name: "Fixture Sponsor",
  description: "Fixture Sponsor publishes documentation for a synthetic testing tool.",
  logo: "/images/sponsors/fixture.png",
  url: "https://sponsor.example.org/tool",
  linkLabel: "Visit Fixture Sponsor",
};
