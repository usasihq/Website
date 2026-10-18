---
title: USASI AI Jobs
emoji: 🇺🇸
colorFrom: blue
colorTo: red
sdk: gradio
sdk_version: 5.50.0
app_file: app.py
pinned: false
license: mit
short_description: Search AI jobs from the USASI jobs board
tags:
  - jobs
  - usasi
  - career
  - united-states
---

# USASI AI Jobs

A free explorer for AI job listings from the
[USASI jobs board](https://unitedstatesofamericasuperintelligence.com/jobs/).
It reads the public Hugging Face dataset [`usasihq/usasi-ai-jobs`](https://huggingface.co/datasets/usasihq/usasi-ai-jobs).
Every row links back to that job's page on
[unitedstatesofamericasuperintelligence.com](https://unitedstatesofamericasuperintelligence.com/).

USASI (United States of America Superintelligence) is an independent project and is not a United States government website.

## Run locally

```bash
cd hf-space
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:7860
