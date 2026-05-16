import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

export function Layout({ title, children }: Props) {
  return (
    <div className="layout">
      <header className="header">
        <p className="eyebrow">arena-prototype</p>
        <h1>{title}</h1>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
