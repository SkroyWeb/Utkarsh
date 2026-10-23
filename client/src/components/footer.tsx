import React, { useState } from 'react';
import { FaXTwitter, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa6';
import { Play, Search, Download, HelpCircle, Mail, MessageSquare, FileText, Shield, Cookie } from 'lucide-react';

/* ---------- Easy settings ---------- */

// Your logo image (the file is client/public/Logo.png).
const LOGO_ICON = '/Logo.png';

// Replace each '#' with your real profile link.
const SOCIAL_LINKS = [
  { label: 'X (Twitter)', href: '#', Icon: FaXTwitter },
  { label: 'LinkedIn', href: '#', Icon: FaLinkedinIn },
  { label: 'YouTube', href: '#', Icon: FaYoutube },
  { label: 'Instagram', href: '#', Icon: FaInstagram },
];

// Replace each '#' with the real page when you have it.
// `accent` is the colour of the short line above each heading.
const LINK_GROUPS = [
  {
    title: 'Features',
    accent: '#3B82F6',
    rowOnPhone: false,
    links: [
      { label: 'Video Lessons', href: '#', Icon: Play },
      { label: 'Web Search', href: '#', Icon: Search },
      { label: 'Download & Share', href: '#', Icon: Download },
    ],
  },
  {
    title: 'Support',
    accent: '#2DD4BF',
    rowOnPhone: false,
    links: [
      { label: 'Help Center', href: '#', Icon: HelpCircle },
      { label: 'Contact', href: '#', Icon: Mail },
      { label: 'Feedback', href: '#', Icon: MessageSquare },
    ],
  },
  {
    title: 'Legal',
    accent: '#8B5CF6',
    // On small phones Legal takes a full row and its links sit side by side.
    rowOnPhone: true,
    links: [
      { label: 'Terms', href: '#', Icon: FileText },
      { label: 'Privacy', href: '#', Icon: Shield },
      { label: 'Cookies', href: '#', Icon: Cookie },
    ],
  },
];

async function subscribeToTips(email: string): Promise<void> {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('subscribe failed');
}

function StudyTipsCard() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      await subscribeToTips(email.trim());
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="rounded-2xl border border-blue-400/30 bg-[#0A1B4F]/60 p-5 shadow-[0_0_45px_-12px_rgba(59,130,246,0.6)] backdrop-blur">
      <div className="flex items-center gap-2 text-white">
        <span className="material-icons text-xl text-blue-300">auto_awesome</span>
        <h3 className="text-[17px] font-semibold">Get study tips</h3>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
        Stay updated with tips, lessons, and product updates.
      </p>
      <form onSubmit={submit} className="mt-4 flex items-center gap-2">
        <label className="sr-only" htmlFor="footer-email">
          Email address
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 focus-within:border-blue-400">
          <span className="material-icons text-base text-slate-400">mail_outline</span>
          <input
            id="footer-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder="Enter your email"
            className="min-w-0 flex-1 bg-transparent py-2 text-[13px] text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Subscribe'}
        </button>
      </form>
      <p
        role="status"
        className={`mt-3 text-[11px] ${
          status === 'done' ? 'text-emerald-300' : status === 'error' ? 'text-rose-300' : 'text-slate-400'
        }`}
      >
        {status === 'done'
          ? 'You’re subscribed. Thanks!'
          : status === 'error'
          ? 'That didn’t work. Try again.'
          : 'No spam. Unsubscribe anytime.'}
      </p>
    </div>
  );
}

/** L-shaped corner line with a glowing dot on the corner point. */
function Corner({ className, shape }: { className: string; shape: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute h-7 w-7 border-blue-400/60 ${shape} ${className}`}>
      <span
        className={`absolute h-[7px] w-[7px] animate-pulse rounded-full bg-blue-300 shadow-[0_0_10px_2px_rgba(96,165,250,0.8)] ${
          shape.includes('border-t') ? '-top-[4px]' : '-bottom-[4px]'
        } ${shape.includes('border-l') ? '-left-[4px]' : '-right-[4px]'}`}
      />
    </span>
  );
}

/** Thin vertical line that fades out at both ends, sitting in the gap before a column. */
function Divider() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -left-5 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-blue-400/40 to-transparent lg:block"
    />
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-20 w-full overflow-hidden bg-gradient-to-br from-[#030A22] via-[#061540] to-[#0A2C8C] text-slate-300">
      {/* faint dotted grid that fades downward */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(147,197,253,0.16) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 65%)',
          maskImage: 'linear-gradient(to bottom, black, transparent 65%)',
        }}
      />

      {/* glowing top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
      />
      {/* glow + glowing wave lines along the bottom, full width */}
      <div className="pointer-events-none absolute -bottom-28 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-blue-600/30 blur-3xl" />
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full"
        viewBox="0 0 1200 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="footer-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#3B82F6" stopOpacity="0" />
            <stop offset="0.5" stopColor="#60A5FA" stopOpacity="0.9" />
            <stop offset="1" stopColor="#3B82F6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d="M0 95 C 200 30, 380 125, 600 80 S 1000 25, 1200 85" fill="none" stroke="url(#footer-wave)" strokeWidth="1.6" />
        <path d="M0 105 C 240 55, 430 130, 680 95 S 1020 55, 1200 100" fill="none" stroke="url(#footer-wave)" strokeWidth="1.1" opacity="0.7" />
        <path d="M0 115 C 260 80, 470 135, 720 108 S 1040 80, 1200 112" fill="none" stroke="url(#footer-wave)" strokeWidth="0.8" opacity="0.5" />
      </svg>

      {/* content, aligned with the rest of the page */}
      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 md:px-6 lg:px-8">
        {/* corner brackets framing the content */}
        <Corner shape="border-l border-t" className="left-1 top-8 md:left-2" />
        <Corner shape="border-r border-t" className="right-1 top-8 md:right-2" />
        <Corner shape="border-b border-l" className="bottom-3 left-1 md:left-2" />
        <Corner shape="border-b border-r" className="bottom-3 right-1 md:right-2" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-2 sm:grid-cols-3 sm:gap-x-8 lg:gap-x-10 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.7fr_1.45fr] lg:px-6">
          {/* Brand */}
          <div className="col-span-2 flex flex-col items-center text-center sm:col-span-3 lg:col-span-1 lg:items-start lg:text-left">
            <div className="inline-flex flex-col items-center lg:items-start">
              <img src={LOGO_ICON} alt="" className="h-14 w-14 rounded-2xl object-contain lg:ml-3" />
              <span className="mt-2 text-[44px] font-extrabold leading-none tracking-tight text-white">Utkarsh</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-300">
              Your personal AI Buddy.
              <br />
              Ask anything, learn everything!
            </p>
            <div className="mt-5 flex justify-center gap-3 lg:justify-start">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => {
                const external = href.startsWith('http');
                return (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-blue-500"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {LINK_GROUPS.map((group, index) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className={`relative text-center lg:pt-2 lg:text-left ${group.rowOnPhone ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              {index === 0 && <Divider />}
              <span
                aria-hidden="true"
                className="mx-auto mb-3 block h-[3px] w-10 rounded-full lg:mx-0"
                style={{ backgroundColor: group.accent, boxShadow: `0 0 10px ${group.accent}99` }}
              />
              <h3 className="text-lg font-semibold text-white">{group.title}</h3>
              <ul
                className={`mt-5 text-[14px] ${
                  group.rowOnPhone
                    ? 'flex flex-wrap justify-center gap-x-6 gap-y-3 sm:mx-auto sm:block sm:w-fit sm:space-y-4 lg:mx-0'
                    : 'mx-auto w-fit space-y-4 lg:mx-0'
                }`}
              >
                {group.links.map(({ label, href, Icon }) => (
                  <li key={label} className="flex justify-start">
                    <a
                      href={href}
                      className="group inline-flex items-start gap-2.5 text-[#B9C8EA] transition hover:text-white sm:gap-3"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-[#7FA8F5] transition group-hover:text-white" strokeWidth={1.75} />
                      <span className="leading-5">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Newsletter */}
          <div className="relative col-span-2 mx-auto w-full max-w-2xl sm:col-span-3 lg:col-span-1 lg:max-w-none">
            <Divider />
            <StudyTipsCard />
          </div>
        </div>

        {/* bottom bar */}
        <div className="mx-2 mt-12 lg:mx-6">
          <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="flex flex-col items-center justify-between gap-3 pt-5 text-[12px] text-slate-300 sm:flex-row">
            <p>© {new Date().getFullYear()} Utkarsh. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span className="material-icons text-sm text-blue-300">auto_awesome</span>
              Honoring your expertise, accelerating your impact.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}