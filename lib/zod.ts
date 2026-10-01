import { z } from "zod";

// Browser CSP deliberately excludes unsafe-eval. Use Zod's interpreter instead
// of probing dynamic compilation and triggering a blocked Function() attempt.
z.config({ jitless: true });

export { z };
