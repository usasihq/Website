import { PageHeader, type Crumb } from "./PageHeader";
import { SupportPanel } from "./SupportPanel";

/** Shell for long-form editorial pages rendered from content/pages/*.mdx. */
export function EditorialPage({
  eyebrow,
  title,
  description,
  crumbs,
  serif = true,
  support = true,
  children,
  aside,
  headerExtra,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  serif?: boolean;
  support?: boolean;
  children: React.ReactNode;
  aside?: React.ReactNode;
  /** Rendered inside the page header, below the description. */
  headerExtra?: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} crumbs={crumbs}>
        {headerExtra}
      </PageHeader>
      <div className="container-page py-12">
        <div className={`prose-usasi ${serif ? "serif" : ""}`}>{children}</div>
        {aside}
      </div>
      {support ? <SupportPanel variant="standard" /> : null}
    </>
  );
}
