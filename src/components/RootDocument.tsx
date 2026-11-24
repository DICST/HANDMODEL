import Script from 'next/script';
import { Providers } from './Providers';
import { LegacyRedirect } from './LegacyRedirect';

/** Documento HTML comum aos dois idiomas (cada idioma tem seu layout raiz com o atributo lang). */
export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <body>
        {/* Barra do Governo Federal, obrigatória em sites .gov.br (INPE) */}
        <div id="barra-brasil" className="hand-gov" style={{ background: '#7F7F7F', height: 20, padding: '0 0 0 10px', display: 'block' }}>
          <ul id="menu-barra-temp" style={{ listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'inline', float: 'left', paddingRight: 10, marginRight: 10, borderRight: '1px solid #EDEDED' }}>
              <a href="http://brasil.gov.br" style={{ fontFamily: 'sans-serif', textDecoration: 'none', color: 'white' }}>
                Portal do Governo Brasileiro
              </a>
            </li>
          </ul>
        </div>
        <Providers locale={lang.startsWith('en') ? 'en' : 'pt-BR'}>
          <LegacyRedirect />
          {children}
        </Providers>
        <div id="footer-brasil" />
        <Script src="https://barra.brasil.gov.br/barra.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
