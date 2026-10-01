import { describe, expect, it } from "vitest";
import { Careers, Dataset, EMPTY_DATASET, safeJobUrl, type NormalizedJob } from "../../lib/jobs/schema";
import { adapters } from "../../lib/jobs/adapters";
import { deduplicate, reconcile } from "../../lib/jobs/reconcile";
import { fetchFeed, MAX_BYTES, postingUrl } from "../../lib/jobs/security";
import { DEFAULT_JOB_FILTERS, filterJobs, parseJobFilters, serializeJobFilters } from "../../lib/jobs/search";
const config = Careers.parse({ url: "https://employer.com/careers", enabled: true, source: { type: "greenhouse", identifier: "employer" }, source_ids: ["careers"], reviewed_at: "2026-09-30" });
const ashbyConfig = Careers.parse({ ...config, source: { type: "ashby", identifier: "employer" } });
const raw = (id = 1) => ({ id, internal_job_id: id + 100, title: "Research Engineer", location: { name: "Boston; New York" }, absolute_url: `https://job-boards.greenhouse.io/employer/jobs/${id}` });
const gh = (rows = [raw()]) => ({ jobs: rows, meta: { total: rows.length } });
const normalize = () => adapters.greenhouse.normalize(gh(), "employer", config);
const T0 = "2026-09-28T00:00:00.000Z", T6 = "2026-09-28T06:00:00.000Z", T12 = "2026-09-28T12:00:00.000Z", T36 = "2026-09-29T12:00:00.000Z";
const first = () => reconcile(EMPTY_DATASET, "employer", config, { ok: true, jobs: normalize() }, T0);
const empty = (state: Dataset, time: string) => reconcile(state, "employer", config, { ok: true, jobs: [] }, time);
describe("careers validation and trust boundary", () => {
  it.each(["javascript:alert(1)", "http://employer.com", "https://a:b@employer.com", "https://127.0.0.1", "https://localhost", "https://evil.local", "https://employer.com:8080", "https://employer.com\\evil"])('rejects unsafe URL %s', url => expect(safeJobUrl(url)).toBe(false));
  it("rejects unsupported adapters and path traversal", () => {
    expect(Careers.safeParse({ ...config, source: { type: "workday", identifier: "x" } }).success).toBe(false);
    expect(Careers.safeParse({ ...config, source: { type: "greenhouse", identifier: "../x" } }).success).toBe(false);
    expect(Careers.safeParse({ ...config, source: { type: "manual", note: "Manual review" } }).success).toBe(false);
  });
  it("rejects hostile tenant/host and keeps identity parameters", () => {
    expect(() => postingUrl("https://job-boards.greenhouse.io/other/jobs/1", config)).toThrow();
    expect(() => postingUrl("https://job-boards.greenhouse.io.evil.com/employer/jobs/1", config)).toThrow();
    expect(postingUrl("https://job-boards.greenhouse.io/employer/jobs/1?gh_jid=1&utm_source=x#apply", config)).toBe("https://job-boards.greenhouse.io/employer/jobs/1?gh_jid=1");
  });
});
describe("official adapters", () => {
  it("preserves unknowns and doesn't use updated_at as posting date", () => {
    const j = normalize()[0];
    expect(j.remote).toBeNull(); expect(j.workplace).toBe("unknown"); expect(j.posted_at).toBeNull(); expect(j.salaries).toEqual([]); expect(j.countries).toEqual([]);
    expect(j.locations).toEqual(["Boston; New York"]);
  });
  it("rejects partial pagination and malformed records instead of closing jobs", () => {
    expect(() => adapters.greenhouse.normalize({ ...gh(), meta: { total: 2 } }, "employer", config)).toThrow();
    expect(() => adapters.greenhouse.normalize(gh([{ ...raw(), id: -1 }]), "employer", config)).toThrow();
  });
  it("accepts Ashby secondary locations whose address is null", () => {
    const rows = adapters.ashby.normalize({ apiVersion: "1", jobs: [{ id: "id", title: "Engineer", isListed: true, jobUrl: "https://jobs.ashbyhq.com/employer/id", location: "San Francisco", address: { postalAddress: { addressCountry: "United States" } }, secondaryLocations: [{ location: "Remote", address: null }] }] }, "employer", ashbyConfig);
    expect(rows).toHaveLength(1);
    expect(rows[0].locations).toEqual(["Remote", "San Francisco"]);
    expect(rows[0].countries).toEqual(["United States"]);
  });

  it("excludes prospect pools and unlisted Ashby jobs", () => {
    expect(adapters.greenhouse.normalize(gh([{ ...raw(), internal_job_id: null } as unknown as ReturnType<typeof raw>]), "employer", config)).toEqual([]);
    expect(adapters.ashby.normalize({ apiVersion: "1", jobs: [{ title: "Hidden", isListed: false, jobUrl: "https://jobs.ashbyhq.com/employer/id" }] }, "employer", ashbyConfig)).toEqual([]);
  });
  it("uses stable IDs, permits same title distinct requisitions, rejects conflicting duplicate IDs", () => {
    const rows = adapters.greenhouse.normalize(gh([raw(1), raw(2)]), "employer", config);
    expect(deduplicate([...rows, rows[0]])).toHaveLength(2);
    expect(() => deduplicate([rows[0], { ...rows[0], title: "Poison" }])).toThrow();
    expect(adapters.greenhouse.normalize(gh([{...raw(), title: "New title"}]), "employer", config)[0].id).toBe(rows[0].id);
  });
  it("removes HTML and accepts only documented salary units and workplace", () => {
    const rows = adapters.ashby.normalize({ apiVersion:"1", jobs:[{ id:"id",title:"<script>unsafe</script> Engineer",isListed:true,jobUrl:"https://jobs.ashbyhq.com/employer/id",workplaceType:"Hybrid",employmentType:"FullTime",location:"Boston",secondaryLocations:[{location:"New York"}],compensation:{compensationTiers:[{title:"Zone 1",components:[{compensationType:"Salary",interval:"1 HOUR",currencyCode:"USD",minValue:50,maxValue:100},{compensationType:"EquityPercentage",interval:"NONE",currencyCode:null,minValue:1,maxValue:2}]}]}}]},"employer",ashbyConfig);
    expect(rows[0].title).not.toContain("<"); expect(rows[0].salaries[0].period).toBe("hour"); expect(rows[0].salaries).toHaveLength(1); expect(rows[0].workplace).toBe("hybrid"); expect(rows[0].locations).toHaveLength(2);
  });
});
describe("conservative reconciliation", () => {
  it("preserves jobs and successful-check dates on failures", () => {
    const old = first(), next = reconcile(old,"employer",config,{ok:false,error:"network"},T6);
    expect(next.jobs).toEqual(old.jobs); expect(next.feeds[0].last_successful).toBe(T0); expect(next.feeds[0].consecutive_failures).toBe(1);
  });
  it("quarantines zero, confirms at six hours, then closes after another day", () => {
    const a = empty(first(),T6); expect(a.jobs[0].status).toBe("open"); expect(a.feeds[0].result).toBe("anomaly");
    const b = empty(a,T12); expect(b.jobs[0].status).toBe("possibly_closed"); expect(b.jobs[0].last_seen).toBe(T0);
    const c = empty(b,T36); expect(c.jobs[0].status).toBe("closed");
    const d = reconcile(c,"employer",config,{ok:true,jobs:normalize()},"2026-09-30T00:00:00.000Z");
    expect(d.jobs[0].status).toBe("open"); expect(d.jobs[0].first_seen).toBe(T0); expect(d.jobs[0].missing_checks).toBe(0);
  });
  it("does not close from repeated checks seconds apart", () => {
    const rows = [...normalize(),{...normalize()[0],id:"employer:greenhouse:employer:2",source_job_id:"2"}] as NormalizedJob[];
    const state = reconcile(EMPTY_DATASET,"employer",config,{ok:true,jobs:rows},T0);
    const a = reconcile(state,"employer",config,{ok:true,jobs:[rows[0]]},T6);
    const b = reconcile(a,"employer",config,{ok:true,jobs:[rows[0]]},T12);
    expect(b.jobs.find(j => j.source_job_id === "2")?.status).toBe("possibly_closed");
  });
  it("retains only bounded closed history", () => {
    const closed = empty(empty(empty(first(),T6),T12),T36);
    expect(empty(closed,"2026-11-01T00:00:00.000Z").jobs).toHaveLength(0);
    expect(reconcile(closed,"employer",config,{ok:false,error:"network"},"2026-11-01T00:00:00.000Z").jobs).toHaveLength(0);
  });
});
describe("URL filters and freshness", () => {
  it("roundtrips, limits malformed inputs, and requires comparable salary units", () => {
    const f = parseJobFilters(new URLSearchParams("company=employer&remote=1&salary_min=150000&sort=garbage&page=-1"));
    expect(f.workplace).toBe("remote"); expect(f.salary_min).toBe(""); expect(f.page).toBe(1); expect(f.sort).toBe("verified");
    expect(parseJobFilters(new URLSearchParams(serializeJobFilters(f)))).toEqual(f);
  });
  it("ages current jobs and separates unknown remote without inventing locations", () => {
    const state = first(), jobs = state.jobs.map(j => ({...j,organization_name:"Employer"}));
    expect(filterJobs(jobs,state.feeds,DEFAULT_JOB_FILTERS,Date.parse(T6))).toHaveLength(1);
    expect(filterJobs(jobs,state.feeds,{...DEFAULT_JOB_FILTERS,workplace:"remote"},Date.parse(T6))).toHaveLength(0);
    expect(filterJobs(jobs,state.feeds,DEFAULT_JOB_FILTERS,Date.parse("2026-10-01T00:00:00Z"))).toHaveLength(0);
    expect(filterJobs(jobs,state.feeds,{...DEFAULT_JOB_FILTERS,view:"unverified"},Date.parse("2026-10-01T00:00:00Z"))).toHaveLength(1);
  });
  it("compares only the chosen currency and period, not the highest salary", () => {
    const state=first(), jobs=state.jobs.map(j=>({...j,organization_name:"Employer",salaries:[{min:100,max:200,currency:"USD",period:"hour" as const,label:null,source_status:"employer-provided" as const}]}));
    const f={...DEFAULT_JOB_FILTERS,currency:"USD",period:"year",salary_min:"50"};
    expect(filterJobs(jobs,state.feeds,f,Date.parse(T6))).toHaveLength(0);
    expect(filterJobs(jobs,state.feeds,{...f,period:"hour"},Date.parse(T6))).toHaveLength(1);
  });
});
describe("bounded fetch", () => {
  const fetcher = (response: Response) => (async () => response) as typeof fetch;
  it("rejects rate limiting, malformed JSON and oversized responses", async () => {
    await expect(fetchFeed(config,fetcher(new Response("",{status:429})))).rejects.toMatchObject({category:"rate-limited"});
    await expect(fetchFeed(config,fetcher(new Response("{bad",{headers:{"content-type":"application/json"}})))).rejects.toMatchObject({category:"payload"});
    await expect(fetchFeed(config,fetcher(new Response("{}",{headers:{"content-type":"application/json","content-length":String(MAX_BYTES+1)}})))).rejects.toMatchObject({category:"payload"});
  });
  it("rejects prototype-poisoning keys", async () => {
    await expect(fetchFeed(config,fetcher(new Response('{"__proto__":{}}',{headers:{"content-type":"application/json"}})))).rejects.toMatchObject({category:"payload"});
  });
  it("requests fixed endpoints with no redirects or credentials", async () => {
    let opts: RequestInit | undefined;
    await fetchFeed(config,(async (_url, options) => {opts=options; return new Response('{}',{headers:{"content-type":"application/json"}});}) as typeof fetch);
    expect(opts?.redirect).toBe("error"); expect(opts?.credentials).toBe("omit");
  });
});

describe("dataset integrity and source isolation", () => {
  it("large drops are quarantined and a network failure breaks confirmation", () => {
    const many=adapters.greenhouse.normalize(gh(Array.from({length:12},(_,i)=>raw(i+1))),"employer",config);
    const initial=reconcile(EMPTY_DATASET,"employer",config,{ok:true,jobs:many},T0);
    const a=reconcile(initial,"employer",config,{ok:true,jobs:many.slice(0,2)},T6);
    expect(a.feeds[0].result).toBe("anomaly"); expect(a.jobs).toHaveLength(12);
    const b=reconcile(a,"employer",config,{ok:false,error:"http"},T12);
    const c=reconcile(b,"employer",config,{ok:true,jobs:many.slice(0,2)},T36);
    expect(c.feeds[0].result).toBe("anomaly"); expect(c.jobs.filter(j=>j.status==="open")).toHaveLength(12);
  });
  it("one failed source leaves another source untouched", () => {
    const otherConfig=Careers.parse({...config,source:{type:"greenhouse",identifier:"other"}});
    const second=reconcile(first(),"other",otherConfig,{ok:true,jobs:[]},T0);
    const failed=reconcile(second,"employer",config,{ok:false,error:"payload"},T6);
    expect(failed.feeds.find(f=>f.organization_slug==="other")).toEqual(second.feeds.find(f=>f.organization_slug==="other"));
    expect(failed.jobs).toEqual(second.jobs);
  });
  it("rejects unknown/disabled organizations and inconsistent health counts", async () => {
    const {validateDataset}=await import("../../lib/jobs/load");
    const {Organization}=await import("../../lib/schema");
    const {org}=await import("../fixtures/content");
    const employer=Organization.parse({...org("employer"),careers:config});
    const state=first();
    expect(validateDataset(state,[employer]).jobs).toHaveLength(1);
    expect(()=>validateDataset(state,[])).toThrow();
    expect(()=>validateDataset(state,[{...employer,publication_status:"draft"}])).toThrow();
    expect(()=>validateDataset({...state,feeds:[{...state.feeds[0],current_count:99}]},[employer])).toThrow();
    expect(()=>validateDataset({...state,jobs:[state.jobs[0],state.jobs[0]]},[employer])).toThrow();
  });
});
