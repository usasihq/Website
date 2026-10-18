"""USASI AI Jobs — free Gradio explorer for usasihq/usasi-ai-jobs."""

from __future__ import annotations

import html
import math
import re
import unicodedata
from functools import lru_cache

import gradio as gr
import pandas as pd
from huggingface_hub import hf_hub_download

DATASET = "usasihq/usasi-ai-jobs"
SITE = "https://unitedstatesofamericasuperintelligence.com"
PAGE_SIZE = 20

US_STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
    "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
    "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
    "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon",
    "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
    "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia",
    "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}

# Unambiguous city phrases employers write without a state code. Matches lib/jobs/geo.ts.
CITY_HINTS = (
    ("san francisco", "CA"), ("sf office", "CA"), ("south san francisco", "CA"),
    ("san jose", "CA"), ("palo alto", "CA"), ("mountain view", "CA"), ("menlo park", "CA"),
    ("redwood city", "CA"), ("sunnyvale", "CA"), ("cupertino", "CA"), ("oakland", "CA"),
    ("berkeley", "CA"), ("los angeles", "CA"), ("san diego", "CA"), ("irvine", "CA"),
    ("seattle", "WA"), ("bellevue", "WA"), ("redmond", "WA"), ("kirkland", "WA"),
    ("new york city", "NY"), ("new york", "NY"), ("nyc", "NY"), ("brooklyn", "NY"),
    ("boston", "MA"), ("chicago", "IL"), ("austin", "TX"), ("dallas", "TX"), ("houston", "TX"),
    ("atlanta", "GA"), ("denver", "CO"), ("boulder", "CO"), ("miami", "FL"),
    ("pittsburgh", "PA"), ("philadelphia", "PA"), ("nashville", "TN"),
    ("salt lake city", "UT"), ("raleigh", "NC"), ("minneapolis", "MN"),
    ("ann arbor", "MI"), ("detroit", "MI"), ("baltimore", "MD"), ("phoenix", "AZ"),
)

_COMBINING = re.compile(r"[\u0300-\u036f]")
_STATE_CODE_RE = {code: re.compile(rf"\b{code}\b") for code in US_STATES}


def short_code(job_id: str) -> str:
    """32-bit FNV-1a as 7 base-36 characters — same as lib/jobs/job-url.ts."""
    h = 0x811C9DC5
    for ch in job_id:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
    chars: list[str] = []
    n = h
    if n == 0:
        chars.append("0")
    while n:
        n, r = divmod(n, 36)
        chars.append(alphabet[r])
    return "".join(reversed(chars)).rjust(7, "0")[-7:]


def title_slug(title: str) -> str:
    s = _COMBINING.sub("", unicodedata.normalize("NFKD", title)).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s.replace("&", " and ")).strip("-")
    if len(s) > 70:
        s = re.sub(r"-[^-]*$", "", s[:71])
    return s.rstrip("-") or "job"


def usasi_page(row: pd.Series) -> str:
    page = row.get("page")
    if isinstance(page, str) and page.startswith("https://"):
        return page
    slug = row.get("employer_slug") or ""
    job_id = str(row.get("id") or "")
    title = str(row.get("title") or "job")
    return f"{SITE}/jobs/at/{slug}/{title_slug(title)}-{short_code(job_id)}/"


def states_in_text(text: str) -> set[str]:
    if not text:
        return set()
    found: set[str] = set()
    for code, name in US_STATES.items():
        if _STATE_CODE_RE[code].search(text) or name.lower() in text.lower():
            found.add(code)
    low = text.lower()
    for hint, code in CITY_HINTS:
        if hint in low:
            found.add(code)
    return found


def _cell(value) -> str:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return ""
    return str(value).strip()


def _truthy_remote(row: pd.Series) -> bool:
    if _cell(row.get("workplace")).lower() == "remote":
        return True
    value = row.get("remote")
    if value is True:
        return True
    if isinstance(value, str) and value.strip().lower() in {"true", "1", "yes"}:
        return True
    return False


def format_pay(row: pd.Series) -> str:
    currency = _cell(row.get("salary_currency")) or "USD"
    period = _cell(row.get("salary_period"))
    try:
        lo = float(row.get("salary_min")) if _cell(row.get("salary_min")) else None
    except (TypeError, ValueError):
        lo = None
    try:
        hi = float(row.get("salary_max")) if _cell(row.get("salary_max")) else None
    except (TypeError, ValueError):
        hi = None
    if lo is None and hi is None:
        return ""
    symbol = "$" if currency == "USD" else f"{currency} "
    def money(n: float) -> str:
        return f"{symbol}{n:,.0f}" if n >= 100 else f"{symbol}{n:,.2f}"
    if lo is not None and hi is not None and lo != hi:
        text = f"{money(lo)}–{money(hi)}"
    else:
        text = money(lo if lo is not None else hi)  # type: ignore[arg-type]
    return f"{text} / {period}" if period else text


def posted_label(value: str) -> str:
    if not value:
        return ""
    return value[:10]


@lru_cache(maxsize=1)
def load_jobs() -> pd.DataFrame:
    last_error: Exception | None = None
    for filename, reader in (("jobs.csv", pd.read_csv), ("jobs.parquet", pd.read_parquet)):
        try:
            path = hf_hub_download(repo_id=DATASET, filename=filename, repo_type="dataset")
            df = reader(path)
            df.columns = [str(c).strip() for c in df.columns]
            return df
        except Exception as exc:  # noqa: BLE001 — try the next snapshot format
            last_error = exc
    raise RuntimeError(f"Could not load {DATASET}: {last_error}")


def _choices(df: pd.DataFrame) -> tuple[list[str], list[str], list[str], list[str]]:
    companies = sorted({_cell(v) for v in df.get("employer", pd.Series(dtype=str)) if _cell(v)})
    workplaces = ["Any", "remote", "hybrid", "on-site", "unknown"]
    employments = ["Any"] + sorted({_cell(v) for v in df.get("employment_type", pd.Series(dtype=str)) if _cell(v)})
    states = ["Any"] + [f"{code} — {name}" for code, name in US_STATES.items()]
    return ["Any"] + companies, workplaces, employments, states


def filter_jobs(
    df: pd.DataFrame,
    keyword: str,
    company: str,
    state: str,
    location: str,
    workplace: str,
    remote_only: bool,
    employment: str,
    has_pay: bool,
) -> pd.DataFrame:
    rows = df
    col = lambda name: rows[name].astype(str) if name in rows.columns else pd.Series("", index=rows.index)
    keyword = (keyword or "").strip().lower()
    if keyword:
        blob = (col("title") + " " + col("employer") + " " + col("locations") + " " + col("employer_slug")).str.lower()
        rows = rows[blob.str.contains(re.escape(keyword), na=False)]
    if company and company != "Any" and "employer" in rows.columns:
        rows = rows[rows["employer"].astype(str) == company]
    location = (location or "").strip().lower()
    if location and "locations" in rows.columns:
        rows = rows[rows["locations"].astype(str).str.lower().str.contains(re.escape(location), na=False)]
    state_code = state.split(" — ", 1)[0] if state and state != "Any" else ""
    if state_code and "locations" in rows.columns:
        rows = rows[rows["locations"].astype(str).map(lambda t: state_code in states_in_text(t))]
    if workplace and workplace != "Any" and "workplace" in rows.columns:
        rows = rows[rows["workplace"].astype(str) == workplace]
    if remote_only:
        rows = rows[rows.apply(_truthy_remote, axis=1)]
    if employment and employment != "Any" and "employment_type" in rows.columns:
        rows = rows[rows["employment_type"].astype(str) == employment]
    if has_pay:
        lo = pd.to_numeric(rows["salary_min"], errors="coerce") if "salary_min" in rows.columns else pd.Series(dtype=float)
        hi = pd.to_numeric(rows["salary_max"], errors="coerce") if "salary_max" in rows.columns else pd.Series(dtype=float)
        rows = rows[lo.notna() | hi.notna()]
    if "posted_at" in rows.columns:
        rows = rows.sort_values("posted_at", ascending=False, kind="stable", na_position="last")
    return rows.reset_index(drop=True)


def render_cards(page_rows: pd.DataFrame) -> str:
    if page_rows.empty:
        return '<p class="usasi-empty">No listings match those filters. Try a broader keyword or clear a filter.</p>'
    cards: list[str] = []
    for _, row in page_rows.iterrows():
        page = html.escape(usasi_page(row), quote=True)
        title = html.escape(_cell(row.get("title")) or "Untitled listing")
        employer = html.escape(_cell(row.get("employer")))
        locations = html.escape(_cell(row.get("locations")) or "Location not stated")
        workplace = html.escape(_cell(row.get("workplace")) or "unknown")
        employment = html.escape(_cell(row.get("employment_type")))
        official = html.escape(_cell(row.get("official_url")), quote=True)
        pay = html.escape(format_pay(row))
        posted = html.escape(posted_label(_cell(row.get("posted_at"))))
        badges: list[str] = []
        if workplace and workplace != "unknown":
            badges.append(f'<span class="usasi-badge">{workplace}</span>')
        if employment and employment != "unknown":
            badges.append(f'<span class="usasi-badge">{employment}</span>')
        if _truthy_remote(row):
            badges.append('<span class="usasi-badge usasi-badge-remote">remote</span>')
        meta_bits = [employer, locations]
        if posted:
            meta_bits.append(f"Posted {posted}")
        cards.append(
            f"""<article class="usasi-card">
  <a class="usasi-title" href="{page}" target="_blank" rel="noopener noreferrer">{title}</a>
  <p class="usasi-meta">{' · '.join(meta_bits)}</p>
  <p class="usasi-badges">{''.join(badges)}{f'<span class="usasi-pay">{pay}</span>' if pay else ''}</p>
  <p class="usasi-links"><a href="{page}" target="_blank" rel="noopener noreferrer">USASI listing</a>
    {' · <a href="' + official + '" target="_blank" rel="noopener noreferrer">Employer posting</a>' if official else ''}</p>
</article>"""
        )
    return '<div class="usasi-list">' + "".join(cards) + "</div>"


def run_search(
    keyword, company, state, location, workplace, remote_only, employment, has_pay, page, df: pd.DataFrame
):
    filtered = filter_jobs(df, keyword, company, state, location, workplace, remote_only, employment, has_pay)
    total = len(filtered)
    pages = max(1, math.ceil(total / PAGE_SIZE) if total else 1)
    try:
        page_n = int(page or 1)
    except (TypeError, ValueError):
        page_n = 1
    page_n = min(max(page_n, 1), pages)
    start = (page_n - 1) * PAGE_SIZE
    chunk = filtered.iloc[start : start + PAGE_SIZE]
    if total == 0:
        status = "No matching listings."
    else:
        end = min(start + PAGE_SIZE, total)
        status = f"Showing **{start + 1}–{end}** of **{total:,}** listings · page {page_n} of {pages}"
    return status, render_cards(chunk), page_n, pages


CSS = """
.gradio-container { max-width: 1080px !important; }
.usasi-header h1 { font-size: 1.7rem; margin: 0 0 0.35rem; color: #1b2a38; letter-spacing: -0.02em; }
.usasi-header p { margin: 0 0 0.4rem; color: #3a4d61; font-size: 1rem; line-height: 1.45; }
.usasi-header a { color: #2d6daa; }
.usasi-kicker { font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; color: #9e3f46; font-weight: 650; margin: 0 0 0.35rem; }
.usasi-note { color: #5b6b7c; font-size: 0.9rem; }
.usasi-list { display: flex; flex-direction: column; gap: 0.75rem; }
.usasi-card { background: #fff; border: 1px solid #dae2e9; border-radius: 14px; padding: 1rem 1.1rem 0.9rem; box-shadow: 0 8px 24px rgba(36, 55, 74, 0.06); border-top: 3px solid #d3a552; }
.usasi-title { color: #1b2a38; font-weight: 650; font-size: 1.05rem; text-decoration: none; }
.usasi-title:hover { color: #2d6daa; text-decoration: underline; }
.usasi-meta { margin: 0.35rem 0 0.45rem; color: #3a4d61; font-size: 0.92rem; }
.usasi-badges { margin: 0; display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; }
.usasi-badge { background: #f1f5f8; color: #2f4357; border-radius: 999px; padding: 0.12rem 0.55rem; font-size: 0.78rem; }
.usasi-badge-remote { background: #e8f4ee; color: #216246; }
.usasi-pay { margin-left: auto; color: #1b2a38; font-weight: 600; font-size: 0.9rem; }
.usasi-links { margin: 0.55rem 0 0; font-size: 0.88rem; }
.usasi-links a { color: #2d6daa; }
.usasi-empty { color: #5b6b7c; padding: 1.2rem 0; }
footer { display: none !important; }
"""

HEADER = f"""
<div class="usasi-header">
  <p class="usasi-kicker">United States of America Superintelligence</p>
  <h1>USASI AI Jobs</h1>
  <p>Search current AI job listings from the
    <a href="{SITE}/jobs/" target="_blank" rel="noopener noreferrer">USASI jobs board</a>.
    Every result opens that job's page on
    <a href="{SITE}/" target="_blank" rel="noopener noreferrer">unitedstatesofamericasuperintelligence.com</a>.</p>
  <p class="usasi-note">Independent project. Not a United States government website.
    Data: <a href="https://huggingface.co/datasets/{DATASET}" target="_blank" rel="noopener noreferrer">{DATASET}</a>.</p>
</div>
"""


def build_demo() -> gr.Blocks:
    df = load_jobs()
    companies, workplaces, employments, states = _choices(df)
    snapshot = ""
    if "last_seen" in df.columns:
        latest = pd.to_datetime(df["last_seen"], utc=True, errors="coerce").max()
        if pd.notna(latest):
            snapshot = latest.strftime("%Y-%m-%d")
    count = f"{len(df):,}"
    theme = gr.themes.Soft(primary_hue="blue", secondary_hue="slate", font=[gr.themes.GoogleFont("Source Sans 3"), "ui-sans-serif", "system-ui", "sans-serif"])

    with gr.Blocks(title="USASI AI Jobs", theme=theme, css=CSS, fill_width=True) as demo:
        gr.HTML(HEADER)
        gr.Markdown(f"{count} open postings in this snapshot" + (f" (listings last seen {snapshot})" if snapshot else "") + ".")
        with gr.Row():
            keyword = gr.Textbox(label="Keyword", placeholder="researcher, ML engineer, policy…", scale=3)
            company = gr.Dropdown(label="Company", choices=companies, value="Any", filterable=True, scale=2)
            state = gr.Dropdown(label="U.S. state", choices=states, value="Any", filterable=True, scale=2)
        with gr.Row():
            location = gr.Textbox(label="Location contains", placeholder="San Francisco, remote, NYC…", scale=2)
            workplace = gr.Dropdown(label="Workplace", choices=workplaces, value="Any", scale=1)
            employment = gr.Dropdown(label="Employment", choices=employments, value="Any", scale=1)
        with gr.Row():
            remote_only = gr.Checkbox(label="Remote only", value=False)
            has_pay = gr.Checkbox(label="Has disclosed pay", value=False)
            search_btn = gr.Button("Search listings", variant="primary")
        status = gr.Markdown()
        results = gr.HTML()
        page = gr.Number(value=1, precision=0, visible=False)
        pages = gr.Number(value=1, precision=0, visible=False)
        with gr.Row():
            prev_btn = gr.Button("Previous")
            next_btn = gr.Button("Next")

        inputs = [keyword, company, state, location, workplace, remote_only, employment, has_pay]

        def search_from_start(*args):
            return run_search(*args, 1, df)

        def turn(delta, keyword, company, state, location, workplace, remote_only, employment, has_pay, page_n):
            return run_search(keyword, company, state, location, workplace, remote_only, employment, has_pay, int(page_n or 1) + delta, df)

        outputs = [status, results, page, pages]
        demo.load(fn=lambda: run_search("", "Any", "Any", "", "Any", False, "Any", False, 1, df), outputs=outputs)
        search_btn.click(fn=search_from_start, inputs=inputs, outputs=outputs)
        keyword.submit(fn=search_from_start, inputs=inputs, outputs=outputs)
        location.submit(fn=search_from_start, inputs=inputs, outputs=outputs)
        for control in (company, state, workplace, employment, remote_only, has_pay):
            control.change(fn=search_from_start, inputs=inputs, outputs=outputs)
        prev_btn.click(fn=lambda *a: turn(-1, *a), inputs=[*inputs, page], outputs=outputs)
        next_btn.click(fn=lambda *a: turn(1, *a), inputs=[*inputs, page], outputs=outputs)
    return demo


demo = build_demo()

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
