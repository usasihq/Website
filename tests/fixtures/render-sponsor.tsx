// Render with the real JSX runtime, outside Playwright's component-test transform.
import { renderToStaticMarkup } from "react-dom/server";
import { HomepageSponsor } from "@/components/HomepageSponsor";
import { sponsorFixture } from "./sponsor";

process.stdout.write(renderToStaticMarkup(<HomepageSponsor config={sponsorFixture} />));
