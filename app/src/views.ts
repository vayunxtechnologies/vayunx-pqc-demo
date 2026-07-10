/*
 * Server-rendered HTML for the VayunX CryptoSPM boardroom demo. No framework — a single
 * shared layout with inline CSS keeps the container tiny and the visual fully deterministic.
 * The dashboard's Cryptographic Posture card is the centrepiece: red/green pills, algorithm,
 * standard, and a one-line risk story per asset, under a big headline banner.
 */

import { User } from './users';

const BRAND = 'VayunX';
const SUB_BRAND = 'CryptoSPM';

const COLORS = {
  navy: '#0B1F3A',
  indigo: '#1E3A8A',
  teal: '#14B8A6',
  red: '#EF4444',
  green: '#10B981',
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · ${BRAND} ${SUB_BRAND}</title>
<style>
  :root {
    --navy: ${COLORS.navy};
    --indigo: ${COLORS.indigo};
    --teal: ${COLORS.teal};
    --red: ${COLORS.red};
    --green: ${COLORS.green};
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    background:
      radial-gradient(1200px 600px at 15% -10%, rgba(30,58,138,0.35), transparent 60%),
      radial-gradient(1000px 500px at 100% 0%, rgba(20,184,166,0.20), transparent 55%),
      var(--navy);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--teal); }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 40px;
    color: #fff;
  }
  .brand { display: flex; align-items: center; gap: 14px; font-weight: 700; letter-spacing: .3px; }
  .logo {
    width: 40px; height: 40px; border-radius: 11px;
    background: linear-gradient(135deg, var(--teal), var(--indigo));
    display: grid; place-items: center; font-weight: 800; color: #fff; font-size: 20px;
    box-shadow: 0 8px 24px rgba(20,184,166,0.35);
  }
  .brand .name { font-size: 19px; }
  .brand .name small { display:block; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: var(--teal); text-transform: uppercase; }
  .topbar .who { font-size: 13px; color: #cbd5e1; }
  .topbar form { display: inline; }
  .btn-ghost {
    background: rgba(255,255,255,0.08); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.18);
    padding: 8px 16px; border-radius: 9px; font-size: 13px; cursor: pointer; font-weight: 600;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.16); }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 20px 40px 60px; }
  .footer {
    text-align: center; color: #94a3b8; font-size: 12px; padding: 26px 0 40px;
    letter-spacing: .3px;
  }
  .footer strong { color: var(--teal); }

  /* Login */
  .login-shell { display: grid; place-items: center; padding: 6vh 20px 40px; }
  .card {
    background: #ffffff; border-radius: 20px; width: 100%; max-width: 430px;
    box-shadow: 0 30px 80px rgba(2, 8, 23, 0.55);
    overflow: hidden;
  }
  .card .head { padding: 34px 38px 8px; }
  .card .head h1 { margin: 0 0 6px; font-size: 24px; color: var(--navy); }
  .card .head p { margin: 0; color: #64748b; font-size: 14px; }
  .card form { padding: 20px 38px 34px; }
  label { display:block; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: .6px; margin: 16px 0 7px; }
  input[type=text], input[type=password] {
    width: 100%; padding: 13px 14px; border: 1px solid #cbd5e1; border-radius: 11px;
    font-size: 15px; background: #f8fafc;
  }
  input:focus { outline: none; border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(30,58,138,0.15); background:#fff; }
  .btn-primary {
    margin-top: 22px; width: 100%; padding: 14px; border: none; border-radius: 11px;
    font-size: 15px; font-weight: 700; color: #fff; cursor: pointer;
    background: linear-gradient(135deg, var(--indigo), var(--teal));
    box-shadow: 0 12px 30px rgba(30,58,138,0.4);
  }
  .btn-primary:hover { filter: brightness(1.05); }
  .error {
    margin-top: 18px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
    padding: 11px 14px; border-radius: 10px; font-size: 13.5px;
  }
  .hint { margin-top: 20px; font-size: 12.5px; color: #94a3b8; text-align:center; }
  .hint code { background:#f1f5f9; padding: 2px 6px; border-radius: 6px; color:#334155; }

  /* Dashboard */
  .banner {
    border-radius: 18px; padding: 26px 30px; margin-bottom: 24px; color: #fff;
    display:flex; align-items:center; justify-content: space-between; gap: 20px;
    box-shadow: 0 24px 60px rgba(2,8,23,0.5);
  }
  .banner.vuln { background: linear-gradient(120deg, #7f1d1d, var(--red)); }
  .banner.safe { background: linear-gradient(120deg, #065f46, var(--green)); }
  .banner .headline { font-size: 30px; font-weight: 800; letter-spacing: .5px; margin: 0 0 4px; }
  .banner .sub { font-size: 14px; opacity: .92; margin: 0; }
  .banner .profile-tag {
    font-size: 12px; text-transform: uppercase; letter-spacing: 1.4px; font-weight: 700;
    background: rgba(255,255,255,0.18); padding: 8px 14px; border-radius: 999px; white-space: nowrap;
  }

  .panel {
    background: #fff; border-radius: 18px; padding: 8px 8px 12px;
    box-shadow: 0 22px 55px rgba(2,8,23,0.42);
  }
  .panel h2 { margin: 18px 22px 4px; font-size: 18px; color: var(--navy); }
  .panel .desc { margin: 0 22px 12px; color:#64748b; font-size: 13px; }

  .asset {
    display: grid; grid-template-columns: 210px 1fr auto; gap: 18px; align-items: center;
    padding: 20px 22px; border-top: 1px solid #eef2f7;
  }
  .asset:first-of-type { border-top: none; }
  .asset .aname { font-weight: 700; color: var(--navy); font-size: 15px; }
  .asset .aname .algo {
    display:inline-block; margin-top: 6px; font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 12px; background:#f1f5f9; color:#0f172a; padding: 3px 9px; border-radius: 7px;
  }
  .asset .astd { display:block; margin-top: 6px; font-size: 11.5px; color:#94a3b8; letter-spacing:.3px; }
  .asset .adetail { color:#475569; font-size: 13.5px; line-height: 1.5; }
  .pill {
    justify-self: end; white-space: nowrap; font-weight: 800; font-size: 12px; letter-spacing: .6px;
    text-transform: uppercase; padding: 9px 16px; border-radius: 999px; display:inline-flex; align-items:center; gap:8px;
  }
  .pill.vulnerable { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
  .pill.safe { background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; }
  .dot { width: 9px; height: 9px; border-radius: 50%; display:inline-block; }
  .pill.vulnerable .dot { background: var(--red); box-shadow: 0 0 0 4px rgba(239,68,68,.18); }
  .pill.safe .dot { background: var(--green); box-shadow: 0 0 0 4px rgba(16,185,129,.18); }

  .story {
    margin-top: 22px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px; padding: 20px 24px; color: #cbd5e1; font-size: 13.5px; line-height: 1.6;
  }
  .story b { color: #fff; }

  .banner.welcome { background: linear-gradient(120deg, var(--indigo), var(--teal)); }
  .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .tile { background: #fff; border-radius: 16px; padding: 22px 24px; box-shadow: 0 22px 55px rgba(2,8,23,0.42); }
  .tile .t-num { font-size: 30px; font-weight: 800; color: var(--navy); }
  .tile .t-label { color: #64748b; font-size: 13px; margin-top: 4px; }
  .act { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; padding: 18px 22px; border-top: 1px solid #eef2f7; }
  .act:first-of-type { border-top: none; }
  .act .adetail { color:#475569; font-size: 13.5px; }
  .act .when { font-size: 11.5px; color:#94a3b8; letter-spacing:.3px; }

  @media (max-width: 720px) {
    .asset { grid-template-columns: 1fr; }
    .pill { justify-self: start; }
    .tiles { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function topbar(user?: User): string {
  const right = user
    ? `<div style="display:flex;align-items:center;gap:16px;">
         <span class="who">Signed in as <strong>${esc(user.displayName)}</strong></span>
         <form method="post" action="/logout"><button class="btn-ghost" type="submit">Sign out</button></form>
       </div>`
    : `<span class="who">Boardroom Demo</span>`;
  return `<div class="topbar">
    <div class="brand">
      <div class="logo">V</div>
      <div class="name">${BRAND}<small>${SUB_BRAND}</small></div>
    </div>
    ${right}
  </div>`;
}

export function loginPage(error?: string): string {
  const errorHtml = error ? `<div class="error">${esc(error)}</div>` : '';
  const body = `
    ${topbar()}
    <div class="login-shell">
      <div class="card">
        <div class="head">
          <h1>Secure Sign-In</h1>
          <p>Access the ${BRAND} ${SUB_BRAND} console.</p>
        </div>
        <form method="post" action="/login" autocomplete="off">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" placeholder="admin" autofocus />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" placeholder="••••••••" />
          ${errorHtml}
          <button class="btn-primary" type="submit">Sign in</button>
          <div class="hint">Demo credentials: <code>admin</code> / <code>password123</code></div>
        </form>
      </div>
    </div>
    <div class="footer">Scanned by <strong>${BRAND} ${SUB_BRAND}</strong> · continuous cryptographic posture management</div>
  `;
  return layout('Sign In', body);
}

/**
 * A plain, normal-looking dashboard — identical whether the app runs the classical or the PQC
 * profile. The app never advertises its own crypto; VayunX CryptoSPM is what inspects and reports
 * the posture externally. So a viewer can't tell "before" from "after" by looking at the app.
 */
export function dashboardPage(user: User): string {
  const body = `
    ${topbar(user)}
    <div class="wrap">
      <div class="banner welcome">
        <div>
          <p class="headline">Welcome to your dashboard</p>
          <p class="sub">Signed in as ${esc(user.displayName)} — here's your account at a glance.</p>
        </div>
        <span class="profile-tag">${BRAND} ${SUB_BRAND}</span>
      </div>

      <div class="tiles">
        <div class="tile"><div class="t-num">12</div><div class="t-label">Documents</div></div>
        <div class="tile"><div class="t-num">3</div><div class="t-label">Shared with you</div></div>
        <div class="tile"><div class="t-num">98%</div><div class="t-label">Storage free</div></div>
      </div>

      <div class="panel">
        <h2>Recent activity</h2>
        <p class="desc">Your latest account activity.</p>
        <div class="act"><div class="adetail">You signed in successfully.</div><span class="when">just now</span></div>
        <div class="act"><div class="adetail">A new session was started for your account.</div><span class="when">just now</span></div>
        <div class="act"><div class="adetail">Profile settings reviewed.</div><span class="when">earlier today</span></div>
      </div>
    </div>
    <div class="footer">Powered by <strong>${BRAND} ${SUB_BRAND}</strong></div>
  `;
  return layout('Dashboard', body);
}
