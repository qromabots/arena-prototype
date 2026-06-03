import type { ReactNode } from 'react';

type Props = {
  title: string;
  wide?: boolean;
  children: ReactNode;
};

export function Layout({ title, wide, children }: Props) {
  return (
    <div className={wide ? 'layout layout-wide' : 'layout'}>
      <header className="header">
        <p className="eyebrow">arena-prototype</p>
        <h1>{title}</h1>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
