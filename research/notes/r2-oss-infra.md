# r2-oss-infra: research notes (2026-09-29)

Validation: `npx tsx scripts/validate.ts` reports no errors or warnings in these files. The two errors left in the full run are in other groups' files: `mochi-1-preview` and `slimpajama`.

Method:

- Company pages were read with curl or WebFetch. Pages that render only with JavaScript were read in the browser pane: lightning.ai, unsloth.ai, and the Qualcomm press release.
- LICENSE files and READMEs were read as raw GitHub files. The github.com/blob URLs I cite were confirmed to return 200.
- The GitHub API was rate-limited, so I read release lists from the HTML releases pages and latest package versions from the PyPI JSON API.
- SEC documents (Qualcomm 10-Q; Form D for Modal, Baseten, and Lightning AI) were read with WebFetch. No identifying User-Agent was sent.

## Organizations

| Slug | Decision | Basis | HQ (source) |
| --- | --- | --- | --- |
| modular | published | us-headquarters (Qualcomm subsidiary; parent_org_slug qualcomm) | Los Altos, CA (terms of service; about page says "Silicon Valley") |
| modal | published | us-headquarters | New York, NY (Form D filed 2026-08-31; company page) |
| baseten | published | us-headquarters | San Francisco, CA (Form D filed 2026-06-30; privacy policy) |
| lightning-ai | published | us-headquarters | San Francisco, CA (Form D filed 2026-01-08 by Lightning AI, Inc., formerly Voltage Park, Inc.) |
| chroma | published | us-headquarters | San Francisco, CA (terms notice address, privacy policy, careers) |
| lancedb | published | us-headquarters (weakest evidence in this group) | San Francisco, CA (YC directory plus a LanceDB blog post) |
| unsloth | **draft** | pending_review / undetermined | not documented |

## Artifacts

| Slug | Kind | Decision | License(s) |
| --- | --- | --- | --- |
| mojo | framework | published | Apache-2.0 WITH LLVM-exception |
| max | runtime | published | Apache-2.0 WITH LLVM-exception (open components) plus the Modular Community License (spdx null) |
| pytorch-lightning | framework | published | Apache-2.0 |
| chroma-db | runtime | published | Apache-2.0 |
| lance | framework | **draft** (pending_review / undetermined) | Apache-2.0 |
| unsloth-library | framework | **draft** (pending_review / undetermined) | Apache-2.0 (core) plus AGPL-3.0-only (studio/, unsloth_cli/) |

For Modular I made separate `mojo` and `max` records, not a combined `max-mojo`, because their licensing differs:

- **Mojo** is fully open source, including the compiler (Aug 18, 2026).
- **MAX** is only partly open:
  - The Python API, serving code, pipelines, and GPU kernels are Apache-2.0 WITH LLVM-exception.
  - The MAX package is distributed under the Modular Community License.
  - Modular says it is "making the remaining MAX source" (compiler, runtime, device APIs) available under the Community License, but gives no date. The MAX `source_code` checklist item is therefore `partial`.

## Material changes found

- **Modular was acquired by Qualcomm.**
  - Qualcomm's 10-Q gives July 28, 2026 as the completion date; the announcements are dated July 29.
  - I recorded this in `status_note`, set `ownership_category: unit-of-another-organization`, and set parent `qualcomm` / `subsidiary`. The Qualcomm record from another group already describes the same deal.
- **Mojo 1.0** was released Aug 11, 2026.
- **The Mojo compiler was open-sourced** Aug 18, 2026 (ModCon). The 26.6 release (Sept 17) says the compiler now accepts outside contributions.
- **The MAX license dropped its device-count limits** (Aug 18, 2026).
- **Lightning AI merged with Voltage Park.**
  - The merger was announced complete on Jan 21, 2026, and the combined company operates as Lightning AI.
  - The Form D shows that "Lightning AI, Inc." is the former Voltage Park, Inc., with a San Francisco principal place of business.
  - The website privacy policy (2023) still names Grid.ai, Inc. dba Lightning AI at a New York address. I left `legal_name` null and explained this.
- **PyTorch Lightning supply-chain compromise (CVE-2026-44484).**
  - PyPI versions 2.6.2 and 2.6.3 (April 30, 2026) were malicious uploads made with stolen PyPI credentials.
  - I recorded this as a run note from the GitHub advisory and the Lightning AI blog.
- **Lance moved to community governance** on Nov 18, 2025: it now has its own lance-format GitHub org, lance.org, and a PMC. (github.com/lancedb/lance now redirects there.)
- **Baseten acquired Blaxel** (Sept 10, 2026). I recorded this as a notable fact. It is an acquisition *by* Baseten, so Baseten's status does not change.
- **No status changes found** for Modal, Chroma, or LanceDB. I did not record funding news, such as reports of a Modal round.

## Open questions / needs human review

1. **lance (draft).**
   - Lance is governed by a volunteer PMC with binding votes and a per-member veto. It is not in a foundation and has no legal entity.
   - 9 of 19 PMC members self-report LanceDB as their affiliation; the others list eight other companies.
   - No single documented governing entity exists, so I could not establish `us-governed-project`. An editor needs to decide the policy for multi-company community governance.
   - If the lead prefers a clearly eligible record, the **LanceDB OSS library** (github.com/lancedb/lancedb, Apache-2.0, in LanceDB's own GitHub org) could be a new slug such as `lancedb-oss`. I did not create it because it was not assigned.
2. **unsloth (draft) and unsloth-library (draft).**
   - Copyright notices name "Unsloth AI Inc.", but no page gives its incorporation or principal office.
   - unsloth.ai/terms and /privacy return 404, and EDGAR has no match.
   - The YC directory (San Francisco) and the GitHub org profile (United States) are self-reported directory fields. I did not treat them as enough.
   - Documents that would resolve this: a Delaware or other state registration, a Form D, or company terms that name an address.
3. **lancedb HQ evidence is thin.**
   - The sources are the YC directory, an intern blog post on lancedb.com ("based in San Francisco"), terms governed by California law, and the GitHub org location.
   - The entity name is inconsistent: "LanceDB Inc." in the footer, "LanceDB Systems, Inc." in the privacy PDF.
   - No EDGAR match was found for either name. I published it; downgrade it to draft if the editor wants an address-bearing source.
4. **Chroma HQ** comes from the terms-of-service notice address, a mailbox-style "#4728" suite on Market Street. It is consistent with the privacy policy and SF-only job listings.
5. **Mojo and MAX PyPI metadata** declare `LicenseRef-MAX-Platform-Software-License`, even though the repo LICENSE is Apache-2.0 WITH LLVM-exception. The prebuilt packages may carry different terms from the source, so I noted this in `license_notes`.
6. **Modal and Baseten** are hosted platforms; I made products only.
   - Modal publishes its client library (Apache-2.0) and examples (MIT), which I noted in `openness_summary` only.
   - Baseten publishes **Truss** (MIT), its CLI for packaging and deploying models to Baseten. It is platform-tied, and I found no separate governance. I mentioned it in `openness_summary` and did not create a record.
7. **Lightning AI** also hosts LitServe, LitGPT, TorchMetrics, and lightning-thunder. These are candidates for later records. I did not read their licenses.

## Surprising / ambiguous

- Modular's 10-Q completion date (July 28) differs by one day from the press releases (July 29). The record states both.
- The Mojo directory README still lists only the stdlib, proposals, and docs, but `Mojo/lib` contains compiler sources (`Compiler`, `MojoParser`, and others). The top-level README lists "Mojo compiler: /Mojo".
- The repo README says compiler contributions are "not accepted yet", which contradicts the 26.6 post. Both are noted.
- The chromadb PyPI release is 1.5.9 from May 5, 2026, with no newer release on GitHub. The README's "weekly release cadence" claim therefore did not match, and I omitted it.
- The unsloth.ai "Community License" page (unsloth.ai/license) actually contains privacy-policy text. It was not used.
