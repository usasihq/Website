# B7 fact-check (2026-10-13)

I fetched every cited source today with curl (`-A "USASI-factcheck/0.3"`, unauthenticated) and checked it against the claims. All sources resolved (HTTP 200). No duplicates were found in `content/people`, `content/leaders` or other batches. No pronouns, locations, nationality, follower or star counts, or money appear in the final files.

## binyuan-hui — corrected (published)
- Identity: homepage huybery.github.io and GitHub `huybery` (titled "Binyuan Hui"). Hui is on the arXiv author lists of OpenHands (2407.16741), StarCoder2 (2402.19173), Qwen2.5-Coder (2409.12186, first author), Qwen (2309.16609) and Qwen3 (2505.09388).
- Catalog tie (`openhands`, `starcoder2`): the homepage says "initiator of OpenDevin", which links to the OpenDevin repo. The tie is more than one co-authorship.
- Added: source `openhands-commits` (https://github.com/OpenHands/OpenHands/commits/main/?author=huybery). It shows Hui's commits from March to May 2024, including "Support BIRD benchmark", Tailwind/daisyUI front-end support and session-id/repository fixes. Added this to the OpenHands contribution.
- Corrected: StarCoder2 contribution. Before: "trained StarCoder2 models with 3B, 7B and 15B parameters". After: "introduces the StarCoder2 family of code models". I removed the counts.
- Current role: the homepage says "currently" at Qwen, but the GitHub company field reads "Formerly @ Qwen". Keeping the Qwen role as past and the sector as independent is supported. The bio already says this.

## junyang-lin — set to draft
- Confirmed: the homepage says "Independent researcher". It lists Qwen3, Qwen3-VL, Qwen3-Coder, GSPO and gated attention. Lin is on the arXiv author lists of OpenHands, Qwen, Qwen3 and GSPO. The GitHub profile pins OpenHands.
- Catalog tie is too thin. The only tie is one co-authorship of the OpenHands paper. Lin's OpenHands commit history (`commits/main/?author=JustinLin610`) shows only README edits and an MVP roadmap update from March to April 2024. That is not substantive work on the project, and no role at a catalog organization is documented. **Set `publication_status: draft`** per the editor's rule.
- Corrected: headline. Before: "...co-author of OpenHands and the Qwen3 technical report". After: "...co-author of the OpenHands and Qwen3 papers". Lin co-authored the paper, not the software.

## kai-fu-lee — corrected (published)
- Confirmed: 01.AI's About/Management Team page says "Founder and CEO of 01.AI" (founded May 2023), founded Sinovation Ventures in 2009, Google global VP, founded MSRA while Microsoft global VP, and roles at Apple and SGI. The Sinovation homepage says "founded by a team led by Dr. Kai-Fu Lee in 2009". The Microsoft 1998 release confirms director of advanced interactive systems, Cosmo Software/SGI and six years at Apple. The CMU 2015 page confirms the 1988 PhD with Sphinx and that Lee is a former faculty member. The CMU RI page confirms the 1990 Sphinx paper by K. F. Lee, H. W. Hon and Raj Reddy.
- Corrected: the CMU honorary degree. Before: "CMU awarded Lee an honorary Doctor of Business Practice in 2015". After: "named Lee a recipient … at its 2015 commencement". The source is a pre-commencement announcement ("will receive").
- Corrected: CMU role. Before: "Faculty member". After: "Assistant Professor", per the ms-1998 release (added to source_ids). The bio now says "served on CMU's faculty as an assistant professor".
- Catalog tie: past roles at `google`, `microsoft`, `apple` and `carnegie-mellon-university`. Strong.

## shusheng-yang — corrected (published)
- Confirmed: the homepage (updated September 2026) says "Ph.D. student at NYU Courant, advised by Prof. Saining Xie". It confirms the research interests and the equal-contribution marks: Cambrian-S first author (ICLR 2026), Thinking in Space co-first author (CVPR 2025 oral), Cambrian-1 co-author (NeurIPS 2024 oral) and Qwen-VL co-first author. arXiv author lists and abstracts match. The Cambrian-S, Thinking in Space and Cambrian-1 repos are Apache 2.0, and Qwen-VL uses the Tongyi Qianwen license. The GitHub account `vealocia` is Shusheng Yang's.
- Catalog tie: current research role at `new-york-university` on NYU-led projects.
- Corrected: Thinking in Space contribution. Before: "a video-based benchmark of over 5,000 question-answer pairs". After: "a video-based visual-spatial intelligence benchmark". I removed the count.

## song-han — corrected (published)
- Confirmed: the HAN Lab bio says associate professor with tenure at MIT EECS. It also confirms Deep Compression, EIE, TinyML, SmoothQuant/AWQ/StreamingLLM, the MLSys'24 best paper award, the NSF CAREER Award, the Sloan Fellowship and EfficientML.ai. The MIT EECS directory lists Associate Professor. The NVIDIA Research page says "a research director at NVIDIA, where he leads the Efficient AI team". arXiv author lists for AWQ, SmoothQuant and StreamingLLM match. The llm-awq, smoothquant and streaming-llm repos are MIT-licensed. efficientml.ai redirects to the HAN Lab course page for 6.5940.
- Corrected: AWQ contribution. Before: "describes TinyChat as targeting resource-constrained edge platforms such as NVIDIA Jetson Orin". After: "describes TinyChat as a turn-key solution for on-device inference on resource-constrained edge platforms and shows it running on NVIDIA Jetson Orin". This matches the README wording.
- Catalog tie: `mit`, `nvidia` and artifact `awq`. Strong.

## yangqing-jia — corrected (published)
- Confirmed: the daggerfs.com homepage lists Intent Lab (Founder and CEO), VP at NVIDIA, Lepton AI (acquired by NVIDIA), VP at Alibaba Group (President of Alibaba Cloud's Computing Platform; Head of System AI Lab, DAMO), Director of Engineering at Facebook (AI platform, co-lead of PyTorch 1.0, Caffe2/ONNX) and Google Brain (TensorFlow early design). The GitHub company field is `@intentlab-ai`. The Caffe site says "Created by Yangqing Jia … during his PhD at UC Berkeley" and lists the BSD 2-Clause license. Jia is first author of the Caffe paper and a co-author of the TensorFlow paper. The PyTorch LICENSE has a "From Caffe2" section naming Jia's contributions. ONNX and TensorFlow are Apache 2.0.
- Corrected: ONNX wording. Before: bio "created Caffe2 and ONNX" and work "which Jia's homepage says Jia created". After: "created Caffe2, co-created ONNX" and "per Jia's homepage, which lists the work under Jia's role at Facebook". The homepage's Projects section says "Co-creator".
- NVIDIA VP has no dates on the homepage. Keeping it as `current: false` with Intent Lab listed first is acceptable, and the bio makes no claim that it is current.
- Catalog tie: `meta`, `google`, `uc-berkeley`, `nvidia`, plus `pytorch`, `onnx` and `tensorflow`. Strong.

## zhilin-yang — corrected (published)
- Confirmed from the visible homepage text, with commented-out HTML ignored: "I am working on a startup". It gives the CMU SCS PhD in 2019, advised by Salakhutdinov and Cohen, and says "worked at Meta AI with Jason Weston, and Google Brain with Quoc V. Le". The arXiv author lists for XLNet and Transformer-XL show equal contribution with Zihang Dai. Both repos are Apache-2.0 with code and pretrained models. GitHub `kimiyoung` is Zhilin Yang's.
- Corrected: XLNet description. Before: "uses Transformer-XL as its backbone". After: "integrates ideas from Transformer-XL", which is the abstract's wording.
- Catalog tie: documented past work at `google` (Google Brain) and `meta`, and doctoral research at `carnegie-mellon-university` that produced XLNet and Transformer-XL with Google Brain co-authors. Adequate.

## Totals
- Files checked: 7
- Corrected (still published): 6 (binyuan-hui, kai-fu-lee, shusheng-yang, song-han, yangqing-jia, zhilin-yang)
- Set to draft: 1 (junyang-lin; its headline was also corrected)
- Deleted: 0
- Validator: `7 batch file(s): 0 error(s), 0 warning(s)`
