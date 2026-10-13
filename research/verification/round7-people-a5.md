# A5 fact-check (2026-10-13)

All cited sources were re-fetched on 2026-10-13 with curl (`-A "USASI-factcheck/0.3"`, unauthenticated). GitHub profiles were read from the public HTML pages because the unauthenticated API was rate-limited. No browser tools or logins were used. Every file passed the scan for privacy, he/she pronouns, superlatives, counts and money ("He" appears only as Horace He's surname). All catalog slugs used exist in ORG_SLUGS.txt or ARTIFACT_SLUGS.txt.

Shared sources confirmed:
- PyTorch maintainers page: PyTorch 2.14 docs, created 2026-05-18, last updated 2026-06-05. Every lead, core, module, emeritus and sunsetted listing quoted in the batch matches it.
- arXiv 1912.01703: the abstract page and the PDF author block, including affiliations.
- The PyTorch 2 ASPLOS '24 PDF author block, including affiliations.
- The pytorch LICENSE (BSD-style, with "(Adam Paszke)" in the copyright notice) and CODEOWNERS.
- The JAX README "Citing JAX" bibtex and the JAX Apache-2.0 LICENSE.

## Per file

- **adam-paszke**: checked OK. The GitHub bio "Author of PyTorch. Research Scientist @ Google." and the @google company field match. Paszke is first author of the paper, appears in the LICENSE copyright line, is listed as an emeritus maintainer of nn, autograd and multiprocessing, and is named in the JAX citation.
- **alban-desmaison**: corrected.
  - Before: the bio said Desmaison "in March 2026 gave the featured NVIDIA GTC talk …".
  - After: PyTorch's blog announced Desmaison as the speaker for the featured GTC 2026 session, scheduled for March 2026.
  - Why: the cited post (2026-03-09) is a pre-event announcement for 2026-03-16. It does not confirm that the talk took place.
  - Confirmed as written: "Research Engineer at Meta and the Lead Core Maintainer" (PyTorch 2.12 Q&A page).
- **dmytro-dzhulgakov**: checked OK. The fireworks.ai/team page lists "Co-Founder" and "Previously PyTorch core maintainer at Meta". The maintainers page lists Dzhulgakov as an emeritus core maintainer and an emeritus C10 maintainer.
- **edward-yang**: checked OK.
  - The EU 2026 recap gives "Research Engineer at Meta" and the "PyTorch Updates" keynote.
  - The NA 2026 keynote post (2026-08-20) lists Yang with Meta.
  - Maintainer roles and both papers match.
- **greg-chanan**: checked OK. Chanan is a core maintainer, an emeritus torch.nn maintainer, and listed under XLA (sunsetted) as "Gregory Chanan (gchanan)". The 2019 paper lists Chanan with FAIR and the 2024 paper with Meta. Sector stays null.
- **horace-he**: corrected (current role).
  - Before: Thinking Machines Lab `current: true`, sector `corporate`.
  - After: Thinking Machines Lab `current: false`, sector `null`, and the headline was reworded.
  - Why: the only TML source is the 2025-09-10 Connectionism post. Its citation reads "He, Horace and Thinking Machines Lab", and no later TML blog or news post names Horace He. Horace He's own pages still say Meta: horace.io says "currently work on PyTorch at Meta" and thonking.ai/about says "work on PyTorch Compilers at Meta". The current employer is therefore unclear. Both employers are now recorded as documented past associations.
  - Still current, and the basis of the catalog tie: PyTorch core maintainer (maintainers page).
- **jake-vanderplas**: checked OK.
  - JEP authorship and dates match: 9407 (December 2021), 18137 (October 2023), 28845 (@jakevdp, November 2025), and 9263 (with Roy Frostig, August 2023).
  - The GitHub company field is Google.
  - VanderPlas is named in the JAX citation.
- **james-bradbury**: checked OK. Bradbury is named in the JAX citation, co-authored the 2019 paper (listed with Google), and is credited as "jekbradbury@" on the January 2023 shard_map JEP. Google stays `current: false`, which is conservative. Sector stays null.
- **jane-xu**: checked OK. Xu maintains optim and the C++ API (libtorch + StableABI). CODEOWNERS lines for janeyx99 cover /torch/optim/, /test/optim/, Foreach*, Fused*, /torch/csrc/stable/ and /torch/headeronly/. Sector stays null.
- **joel-schlosser**: corrected (re-sourced).
  - Before: the Meta tie rested only on the GitHub company field "Facebook", which is likely stale.
  - After: added the PyTorch blog post "Presenting Flux Fast" (2025-06-25), whose byline reads "Joel Schlosser (Meta)". The affiliation was renamed "Meta" and cites both sources, and the bio mentions the post.
  - Maintainer and CODEOWNERS claims (/torch/nn/ with albanD) match.
- **joe-spisak**: checked OK.
  - The 2.12 Q&A page gives VP of Product and Head of Open Source at Reflection AI, core maintainer, Governing Board member, and previously at Meta.
  - The 2.14 Q&A page (September 2026) gives "Joseph Spisak of Reflection AI".
  - The EU 2026 recap confirms the keynote title.
  - The Llama 3 paper lists Spisak among the core contributors, defined as at least 2/3 of the project runtime, and its abstract states the public release.
- **mark-saroufim**: checked OK.
  - The homepage states: "cofounder at Core Automation, PyTorch maintainer and cofounder of GPU MODE", "GPU MODE (fka CUDA MODE)", and "torchao: PyTorch native quantization".
  - The NA 2026 keynote post lists "Mark Saroufim, Core Automation: Linear Algebra for the Age of Research".
  - The maintainers page and the PT2 paper (Meta) match.
  - The pytorch/ao LICENSE is BSD-style.
- **matthew-johnson**: checked OK.
  - The JAX citation names "Matthew James Johnson".
  - The SysML 2018 PDF lists Frostig, Johnson and Leary, with Johnson at Google Brain.
  - The Omnistaging JEP is credited to mattjj@ (2020-09-25) and calls itself "more of an upgrade guide". Johnson is also credited on the shard_map JEP.
  - The GitHub profile gives company Google and the bio "research scientist @ Google Brain".
- **matthew-watson**: corrected (stronger tie).
  - Added the KerasHub README "Citing KerasHub" bibtex, whose first listed author is "Watson, Matthew".
  - Rewrote the headline, bio and contribution to lead with that, and retitled the kerashub-repo source.
  - Confirmed: the keras.io guide byline links "Matthew Watson" to github.com/mattdangerw, the pins on that profile, and Apache-2.0.
- **mikayla-gawarecki**: checked OK. Maintainer roles match. Both tutorials show "Author: Mikayla Gawarecki", and the swap_tensors recipe was created 2024-04-19. Sector stays null.
- **natalia-gimelshein**: checked OK. Gimelshein is a core maintainer, a CUDA maintainer, and an emeritus maintainer of NestedTensor and Profiling. The 2019 paper lists NVIDIA and PT2 lists OpenAI, both kept as past. The EU 2026 recap names Gimelshein in "Meet the Developers of PyTorch Module Maintainers".
- **nikita-shulga**: corrected (wording only).
  - Simplified a garbled clause about "Apple Silicon" topics and dated the earlier page (April 2025).
  - The Thinking Machines Lab `current: true` is kept. The PyTorch 2.14 Q&A page for 17 September 2026 reads "Nikkita Shulga of Thinking Machines Lab" (sic). It is the newest official source, and it supersedes the March 2026 page (Meta).
  - CODEOWNERS lists malfet for the mps, metal and /CODEOWNERS paths.
- **peter-hawkins**: checked OK. Hawkins is named in the JAX citation. The GitHub profile gives "JAX @ Google" and company Google.
- **piotr-bialecki**: checked OK.
  - The 2.7 Q&A page says Bialecki joined the PyTorch team at NVIDIA in 2019, currently manages it, works on the CUDA backend, and received the SUPERHERO award in 2023.
  - The 2.13 Q&A page lists Bialecki as a panelist.
  - The GitHub bio is "Deep Learning Frameworks @NVIDIA".
- **roy-frostig**: corrected (metadata). Set jep-jex `published_at` to 2023-05, as the page shows. All other claims match the homepage ("Research scientist, Google DeepMind / Co-author and core developer, JAX", "created JAX with a few colleagues in 2017"), the SysML paper and the JEPs. GitHub gives @google-deepmind.
- **sam-gross**: checked OK.
  - Gross is second author of the 2019 paper (FAIR) and an emeritus maintainer of nn and MKLDNN.
  - PEP 703 lists the author Sam Gross, status Final, created 2023-01-09.
  - GitHub colesbury gives company "Thinking Machines". This is the only source for the current role, so it stays worded as "Company listed on … GitHub profile".

## Totals

- Files checked: 21.
- Corrected: 6 (alban-desmaison, horace-he, joel-schlosser, matthew-watson, nikita-shulga, roy-frostig).
- Set to draft: 0.
- Deleted: 0.
- Validator: `21 batch file(s): 0 error(s), 0 warning(s)`.
