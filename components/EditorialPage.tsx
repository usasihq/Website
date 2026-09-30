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
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  serif?: boolean;
  support?: boolean;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} crumbs={crumbs} />
      <div className="container-page py-12">
        <div className={`prose-usasi ${serif ? "serif" : ""}`}>{children}</div>
        {aside}
      </div>
      {support ? <SupportPanel variant="standard" /> : null}
    </>
  );
}
