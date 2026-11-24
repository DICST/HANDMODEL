'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import type { Lang } from '@/lib/site';

// Destinatário configurado no Contact Form 7 do WordPress original. Sem servidor (GitHub Pages),
// o envio abre o e-mail do visitante com a mensagem pronta: o programa padrão (mailto:) ou,
// para quem usa e-mail no navegador, o Outlook.com / Gmail já preenchidos.
const TO = 'marlon.silva@cemaden.gov.br';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Remove o que costuma vir junto ao colar/autocompletar: espaços, quebras de linha, caracteres
    invisíveis (zero-width, BOM, espaço não separável), aspas e o "Nome <email>" de quem copia do Outlook. */
const cleanEmail = (v: string) => {
  const m = /<([^>]+)>/.exec(v);
  return (m ? m[1] : v).normalize('NFKC').replace(/[\s ​-‍⁠﻿"'<>]/g, '');
};

/** Diz exatamente o que falta, em vez de um genérico "e-mail inválido". */
const emailProblem = (e: string, lang: Lang): string | null => {
  const pt = lang === 'pt';
  if (!e) return null;
  if (!e.includes('@')) return pt ? 'Falta o @ no e-mail.' : 'The e-mail is missing the @.';
  if (e.split('@').length > 2) return pt ? 'O e-mail tem mais de um @.' : 'The e-mail has more than one @.';
  const [user, domain] = e.split('@');
  if (!user) return pt ? 'Falta a parte antes do @.' : 'The part before the @ is missing.';
  if (!/^[^.]+(\.[^.]+)+$/.test(domain)) return pt ? 'Confira o domínio depois do @ (ex.: outlook.com.br).' : 'Check the domain after the @ (e.g. outlook.com).';
  return EMAIL_RE.test(e) ? null : pt ? 'Informe um e-mail válido.' : 'Please enter a valid e-mail address.';
};

const L = {
  pt: {
    name: 'Seu nome',
    email: 'Seu e-mail',
    subject: 'Assunto',
    message: 'Sua mensagem',
    send: 'Enviar',
    required: 'O campo é obrigatório.',
    invalidEmail: 'Informe um e-mail válido.',
    readyTitle: 'Mensagem pronta para envio',
    readyText: `Tentamos abrir seu programa de e-mail. Se nada abriu, envie por um dos botões abaixo (a mensagem já vai preenchida para ${TO}).`,
    outlook: 'Abrir no Outlook.com',
    gmail: 'Abrir no Gmail',
    copy: 'Copiar mensagem',
    copied: 'Mensagem copiada — cole no seu e-mail',
    from: 'De',
    body: 'Corpo da mensagem',
  },
  en: {
    name: 'Your name',
    email: 'Your e-mail',
    subject: 'Subject',
    message: 'Message',
    send: 'Submit',
    required: 'Please fill out this field.',
    invalidEmail: 'Please enter a valid e-mail address.',
    readyTitle: 'Message ready to send',
    readyText: `We tried to open your e-mail app. If nothing opened, send it with one of the buttons below (the message is already filled in for ${TO}).`,
    outlook: 'Open in Outlook.com',
    gmail: 'Open in Gmail',
    copy: 'Copy message',
    copied: 'Message copied — paste it into your e-mail',
    from: 'From',
    body: 'Message body',
  },
};

/** Âncora comum: os webmails abrem em nova aba, fora do roteador do Next. */
const ExternalAnchor = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function ExternalAnchor(props, ref) {
  return <a ref={ref} target="_blank" rel="noopener noreferrer" {...props} />;
});

export function ContactForm({ lang }: { lang: Lang }) {
  const t = L[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tried, setTried] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const nameErr = tried && !name.trim() ? t.required : '';
  const emailErr = !tried ? '' : !email ? t.required : emailProblem(email, lang) ?? '';

  // o aviso aparece junto do botão e entra na tela (antes ficava no topo, fora da área visível)
  useEffect(() => {
    if (draft) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [draft]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!name.trim() || !email || emailProblem(email, lang)) return;
    const mailSubject = `HAND Model "${subject}"`;
    const body = `${t.from}: ${name} <${email}>\n${t.subject}: ${subject}\n\n${t.body}:\n${message}`;
    setDraft({ subject: mailSubject, body });
    setCopied(false);
    setTried(false);
    // os campos são mantidos: se nenhum programa de e-mail abrir, o texto não se perde
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
  };

  const enc = encodeURIComponent;
  const outlookUrl = draft && `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(TO)}&subject=${enc(draft.subject)}&body=${enc(draft.body)}`;
  const gmailUrl = draft && `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(TO)}&su=${enc(draft.subject)}&body=${enc(draft.body)}`;
  const copy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`${TO}\n${draft.subject}\n\n${draft.body}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: 560 }}>
      <FormLayout>
        <TextInput label={t.name} value={name} onChange={setName} isRequired htmlName="your-name" autoComplete="name" status={nameErr ? { type: 'error', message: nameErr } : undefined} />
        <TextInput label={t.email} type="text" inputMode="email" autoCapitalize="none" hasAutoCorrect={false} hasSpellCheck={false} value={email} onChange={(v) => setEmail(cleanEmail(v))} isRequired htmlName="your-email" autoComplete="email" status={emailErr ? { type: 'error', message: emailErr } : undefined} />
        <TextInput label={t.subject} value={subject} onChange={setSubject} htmlName="your-subject" />
        <TextArea label={t.message} value={message} onChange={setMessage} rows={8} htmlName="your-message" maxLength={2000} />
        <HStack>
          <Button label={t.send} type="submit" variant="primary" />
        </HStack>
        {draft && (
          <VStack ref={resultRef} gap={2} role="status" aria-live="polite">
            <Banner status="info" title={t.readyTitle} description={t.readyText} />
            <HStack gap={2} wrap="wrap">
              <Button label={t.outlook} href={outlookUrl!} as={ExternalAnchor} target="_blank" rel="noopener noreferrer" />
              <Button label={t.gmail} href={gmailUrl!} as={ExternalAnchor} target="_blank" rel="noopener noreferrer" />
              <Button label={copied ? t.copied : t.copy} variant="ghost" onClick={copy} />
            </HStack>
          </VStack>
        )}
      </FormLayout>
    </form>
  );
}
