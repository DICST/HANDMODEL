'use client';

import { useEffect } from 'react';
import { BASE } from '@/lib/site';

export function Redirect({ to }: { to: string }) {
  const url = `${BASE}/${to}`;
  useEffect(() => window.location.replace(url), [url]);
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${url}`} />
      <meta name="robots" content="noindex" />
      <p style={{ padding: 24 }}>
        <a href={url}>{url}</a>
      </p>
    </>
  );
}
