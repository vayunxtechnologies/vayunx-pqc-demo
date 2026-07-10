# VayunX Post-Quantum Cryptography Demo

### See the quantum threat. Watch VayunX fix it — automatically.

> **Your users log in every day protected by cryptography a quantum computer will break.**
> This is a working login app that deliberately uses classical, quantum-vulnerable crypto — Ed25519-signed session tokens and SHA-1 password hashes. This is what that looks like today, and how **VayunX** discovers it, opens a **real pull request** that rewrites the code to post-quantum standards (ML-DSA-65 / FIPS 204), and turns the app's security posture from 🔴 to 🟢 — with a one-click rollback safety net.

---

## The 60-second story

- 🔴 **Before.** A normal-looking login + dashboard app. Its **Cryptographic Posture** panel reads **QUANTUM-VULNERABLE**: session tokens signed with **Ed25519**, passwords hashed with **SHA-1**.
- 🔍 **Discover.** VayunX scans the live site (TLS) and the source repo (GitHub). It flags the classical signature scheme, the weak hash, and the classical TLS key exchange — each marked **Quantum-Vulnerable**.
- 🛠️ **Remediate.** One click on **Create PR**. VayunX opens a **real GitHub Pull Request** that deterministically rewrites the signing code from Ed25519 to **ML-DSA-65 (FIPS 204)** and upgrades **SHA-1 → SHA-256**. *A real code diff — not advice.*
- ✅ **After.** Merge the PR, redeploy with the PQC profile, and re-scan: **0 quantum-vulnerable findings**, hybrid post-quantum TLS (**X25519MLKEM768**). The posture panel flips to **PQC-READY 🟢**.
- ↩️ **Safety net.** VayunX can revert the merged PR with one click — the enterprise rollback.

---

## Architecture

```
                        HTTPS (Let's Encrypt)
   ┌─────────┐   80/443   ┌──────────────────┐   8080   ┌────────────────────┐
   │ Browser │──────────▶ │  Caddy (reverse  │────────▶ │  Node/Express app  │
   │         │◀────────── │  proxy + TLS)    │◀──────── │  (TypeScript)      │
   └─────────┘            └──────────────────┘          └────────────────────┘
                                  │                              │
                          TLS key exchange              App-layer crypto assets
                          ─────────────────             ───────────────────────
                   classical:  X25519 (ECDHE)     session tokens: Ed25519  → ML-DSA-65
                   pqc:        X25519MLKEM768      passwords:      SHA-1    → SHA-256
```

- **Caddy** terminates TLS on ports **80/443** and proxies to the app on **8080**.
- The **`SECURITY_PROFILE`** env var selects the live runtime crypto for the app; a matching Caddyfile selects the TLS key exchange.
- Everything runs from a single `docker compose up -d --build`.

---

## What's deliberately vulnerable

| Asset | Algorithm (classical) | Standard / Nature | Quantum Risk |
|---|---|---|---|
| Session token signature | **Ed25519** (EdDSA) | Elliptic-curve signature | 🔴 Broken by **Shor's algorithm** — a quantum computer can forge signatures |
| Password storage | **SHA-1** | Legacy hash | 🔴 Weak / collision-prone; accelerated by **Grover's algorithm** |
| TLS key exchange | **X25519** (ECDHE) | Classical key agreement | 🔴 Harvest-now, decrypt-later — recorded traffic decryptable post-quantum |

After remediation:

| Asset | Algorithm (PQC) | Standard | Posture |
|---|---|---|---|
| Session token signature | **ML-DSA-65** | **FIPS 204** (Module-Lattice Digital Signature) | 🟢 Quantum-resistant |
| Password storage | **SHA-256** | FIPS 180-4 | 🟢 Hardened |
| TLS key exchange | **X25519MLKEM768** | Hybrid (X25519 + ML-KEM-768, FIPS 203) | 🟢 Quantum-resistant hybrid |

---

## Run it locally

The app runs behind Caddy in one command:

```bash
git clone https://github.com/vayunxtechnologies/vayunx-pqc-demo.git
cd vayunx-pqc-demo
cp .env.example .env
docker compose up -d --build
```

Then open the app:

- **Via Caddy** on port 80: <http://localhost>
- **App directly** on port 8080: <http://localhost:8080>

> **Note on local TLS.** Locally you won't have a public domain or a Let's Encrypt certificate, so the host (TLS) scan and real HTTPS are not available. Use the app on port 80 (Caddy) or hit the app directly on **8080**. For the full demo — including the live TLS scan — deploy to EC2 with a real domain (see below).

Log in with the seeded demo credentials shown on the login page, land on the dashboard, and watch the **Cryptographic Posture** panel. In the default **classical** profile it reads **QUANTUM-VULNERABLE 🔴**.

---

## Deploy to EC2 with a domain

For the boardroom demo you want a real domain (e.g. `sampledemo.vayunx.com`) and real HTTPS so the VayunX **host scan** has something to inspect.

👉 Follow the copy-pasteable runbook in **[deploy/EC2.md](deploy/EC2.md)**.

---

## The demo script

Run this as a live 6-step loop. Each step lists **what to say** and **what to click**.

### 1. Deploy & show the vulnerable app
- **Do:** Open `https://sampledemo.vayunx.com`. Log in and land on the dashboard.
- **Say:** *"This is an ordinary login app — the kind every enterprise runs. Users authenticate, get a session, see their dashboard. Looks fine. But notice this panel."*
- **Point at:** the **Cryptographic Posture** panel — **QUANTUM-VULNERABLE 🔴**.
- **Say:** *"Session tokens here are signed with Ed25519, and passwords are hashed with SHA-1. Both are breakable by a quantum computer. Your users are trusting crypto with an expiry date."*

### 2. Discover — two scans
- **Scan #1 — Host scan (TLS).** In VayunX, point a scan at `https://sampledemo.vayunx.com`.
  - **Say:** *"First we look at it the way an attacker on the wire would — the live TLS handshake."* VayunX reports **classical TLS key exchange (X25519)** — vulnerable to harvest-now-decrypt-later.
- **Scan #2 — Source scan (GitHub).** Point a scan at the repo `https://github.com/vayunxtechnologies/vayunx-pqc-demo`.
  - **Say:** *"Now we look inside the code."* VayunX finds **Ed25519 signing** and **SHA-1 password hashing**, each marked **Quantum-Vulnerable**.

### 3. Auto-remediate — the "wow" moment
- **Do:** On the **Ed25519** finding, click **Create PR**.
- **Say:** *"VayunX doesn't just tell you what's wrong — it fixes it. Watch."*
- **What happens:** VayunX opens a **real GitHub Pull Request** that:
  - Rewrites the Ed25519 key generation and signing to **ML-DSA-65 / FIPS 204** — an **AST-based, context-aware** code transform.
  - Applies a mechanical **SHA-1 → SHA-256** fix to password hashing.
- **Say:** *"That's a real code diff in a real pull request — not a ticket, not a recommendation. Your engineers review and merge like any other change."*

### 4. Merge & redeploy
- **Do:** Merge the PR on GitHub. On the EC2 host, pull and redeploy with the **PQC profile** (`SECURITY_PROFILE=pqc` + the PQC Caddyfile — see [Switching classical ↔ PQC](#switching-classical--pqc)).
- **Say:** *"We merge and roll out the post-quantum profile — the same app, now running quantum-resistant cryptography."*

### 5. Scan again — prove it's fixed
- **Do:** Re-run the **source scan** → **0 quantum-vulnerable findings** → **PQC-Ready**. Re-run the **host scan** → **PQC hybrid key exchange (X25519MLKEM768)**.
- **Point at:** the app's **Cryptographic Posture** panel — now **PQC-READY 🟢**.
- **Say:** *"Same app, same users, same login flow — now post-quantum ready. From red to green in minutes."*

### 6. Rollback — the enterprise safety net
- **Do:** In VayunX, click **Revert** on the merged remediation PR.
- **Say:** *"And if anything ever needs to be undone, VayunX reverts the merged PR — a full whole-file restore — with one click. Change with confidence."*

---

## Switching classical ↔ PQC

Two things move together: the **app runtime crypto** (via `SECURITY_PROFILE`) and the **TLS key exchange** (via the Caddyfile).

| Mode | `SECURITY_PROFILE` | Caddyfile | Result |
|---|---|---|---|
| Classical (vulnerable) | `classical` | `proxy/Caddyfile` | Ed25519 + SHA-1, X25519 TLS → 🔴 |
| Post-Quantum (fixed) | `pqc` | `proxy/Caddyfile.pqc` | ML-DSA-65 + SHA-256, X25519MLKEM768 TLS → 🟢 |

**Switch to PQC:**

```bash
# 1. Select the PQC runtime profile
sed -i 's/^SECURITY_PROFILE=.*/SECURITY_PROFILE=pqc/' .env

# 2. Use the PQC Caddyfile (hybrid key exchange)
#    (docker-compose mounts proxy/Caddyfile — point it at the PQC variant)
cp proxy/Caddyfile.pqc proxy/Caddyfile

# 3. Redeploy
docker compose up -d --build
```

To switch back to the vulnerable classical profile, set `SECURITY_PROFILE=classical` and restore the classical `proxy/Caddyfile`.

---

## Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/login` | GET / POST | Login page and session creation (signed session token) |
| `/dashboard` | GET | Authenticated landing page with the Cryptographic Posture panel |
| `/logout` | GET / POST | Clears the session |
| `/health` | GET | Liveness/health check |
| `/posture` | GET | **JSON** posture: active profile, algorithms, and 🔴/🟢 status |
| `/pubkey` | GET | Public signing key (Ed25519 in classical, ML-DSA-65 in PQC) |

---

*Built to demonstrate **VayunX CryptoSPM** — discovery, deterministic auto-remediation, and post-quantum readiness.*
