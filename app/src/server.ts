/*
 * Express wiring for the VayunX CryptoSPM boardroom demo.
 */

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';

import { findUser } from './users';
import { getPasswordHasher } from './passwordPolicy';
import { issueToken, verifyToken } from './tokens';
import { getPosture } from './posture';
import { getSigner } from './signer';
import { loginPage, dashboardPage } from './views';

const PORT = Number(process.env.PORT ?? 8080);
const SESSION_COOKIE = process.env.SESSION_COOKIE ?? 'vayunx_session';
const PROFILE = (process.env.SECURITY_PROFILE ?? 'classical').toLowerCase();

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

function currentUsername(req: Request): string | null {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string') {
    return null;
  }
  const payload = verifyToken(token);
  return payload ? payload.username : null;
}

app.get('/', (req: Request, res: Response) => {
  res.redirect(currentUsername(req) ? '/dashboard' : '/login');
});

app.get('/login', (req: Request, res: Response) => {
  if (currentUsername(req)) {
    res.redirect('/dashboard');
    return;
  }
  res.type('html').send(loginPage());
});

app.post('/login', (req: Request, res: Response) => {
  const username = String(req.body?.username ?? '').trim();
  const password = String(req.body?.password ?? '');
  const user = findUser(username);

  if (!user || !getPasswordHasher().verify(password, user.passwordHash)) {
    res.status(401).type('html').send(loginPage('Invalid username or password.'));
    return;
  }

  const token = issueToken(user.username);
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  res.redirect('/dashboard');
});

app.get('/dashboard', (req: Request, res: Response) => {
  const username = currentUsername(req);
  if (!username) {
    res.redirect('/login');
    return;
  }
  const user = findUser(username);
  if (!user) {
    res.clearCookie(SESSION_COOKIE);
    res.redirect('/login');
    return;
  }
  res.type('html').send(dashboardPage(user, getPosture()));
});

app.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.redirect('/login');
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', profile: PROFILE });
});

app.get('/posture', (_req: Request, res: Response) => {
  res.json(getPosture());
});

app.get('/pubkey', (_req: Request, res: Response) => {
  res.type('text/plain').send(getSigner().publicKeyPem_or_hex());
});

app.listen(PORT, () => {
  const signer = getSigner();
  // eslint-disable-next-line no-console
  console.log(
    `VayunX CryptoSPM demo listening on :${PORT} | profile=${PROFILE} | ` +
      `signer=${signer.algorithm} (${signer.fipsStandard}) | ` +
      `posture=${getPosture().headline}`,
  );
});
