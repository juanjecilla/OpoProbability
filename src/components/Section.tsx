import type { ReactNode } from 'react';

interface SectionProps {
  /** Two-digit ordinal shown in mono to the left of the heading. */
  index: string;
  id: string;
  title: string;
  /** One line under the heading, when the section needs an introduction. */
  lead?: string;
  children: ReactNode;
}

/** The numbered section frame the whole page is built out of. */
export function Section({ index, id, title, lead, children }: SectionProps) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="section__heading">
        <span className="section__index" aria-hidden="true">
          {index}
        </span>
        <h2 id={id}>{title}</h2>
        <span className="section__rule" aria-hidden="true" />
      </div>
      {lead ? <p className="section__lead">{lead}</p> : null}
      {children}
    </section>
  );
}
