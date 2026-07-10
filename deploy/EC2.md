# Deploy the VayunX PQC Demo to EC2

A concise, copy-pasteable runbook to stand up the demo on a public EC2 host with a real domain and HTTPS, so the VayunX **host (TLS) scan** works end-to-end.

**Target:** `https://sampledemo.vayunx.com` on a t3.small running Amazon Linux 2023.

---

## 1. Launch the EC2 instance

- **AMI:** Amazon Linux 2023
- **Instance type:** `t3.small` (2 vCPU / 2 GB is plenty for the demo)
- **Key pair:** select or create one for SSH
- **Storage:** default (8 GB gp3) is fine

### Security group (inbound rules)

| Port | Protocol | Source | Purpose |
|---|---|---|---|
| 22 | TCP | your IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP + Let's Encrypt ACME challenge |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

> Port 80 must be open to the internet — Caddy uses it for the Let's Encrypt HTTP-01 challenge to issue your certificate.

---

## 2. Allocate an Elastic IP and point DNS

1. Allocate an **Elastic IP (EIP)** and associate it with the instance (so the IP survives reboots).
2. In your DNS provider for `vayunx.com`, create an **A record**:

   | Name | Type | Value |
   |---|---|---|
   | `sampledemo` | A | *(the EIP)* |

3. Verify propagation before continuing:

   ```bash
   dig +short sampledemo.vayunx.com
   # should return your EIP
   ```

---

## 3. Install Docker + Compose plugin

SSH in, then:

```bash
sudo ssh -i <your-key>.pem ec2-user@sampledemo.vayunx.com   # from your laptop

# --- on the instance ---
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker

# Docker Compose v2 plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Run docker without sudo (log out/in after this)
sudo usermod -aG docker ec2-user
newgrp docker

docker --version && docker compose version
```

---

## 4. Clone, configure, deploy

```bash
git clone https://github.com/vayunxtechnologies/vayunx-pqc-demo.git
cd vayunx-pqc-demo

cp .env.example .env
```

Edit `.env` and set your domain and the email Let's Encrypt uses for cert notices:

```bash
# .env
DOMAIN=sampledemo.vayunx.com
TLS_EMAIL=you@vayunx.com
SECURITY_PROFILE=classical   # start red for the demo
```

Bring it up:

```bash
docker compose up -d --build
```

---

## 5. Verify

```bash
# App health
curl -sk https://sampledemo.vayunx.com/health

# Cryptographic posture (should show classical / QUANTUM-VULNERABLE)
curl -sk https://sampledemo.vayunx.com/posture | jq .
```

Then open **https://sampledemo.vayunx.com** in a browser — you should see a valid Let's Encrypt certificate (lock icon), the login page, and the dashboard's **QUANTUM-VULNERABLE 🔴** posture panel.

> If the certificate doesn't issue: confirm port 80 is open to `0.0.0.0/0`, DNS resolves to the EIP, and `DOMAIN`/`TLS_EMAIL` are correct. Check logs with `docker compose logs caddy`.

---

## 6. Redeploy with the PQC profile

After merging the VayunX remediation PR, switch the host to post-quantum:

```bash
cd vayunx-pqc-demo
git pull                                   # pull the merged PQC code

# Select the PQC runtime + hybrid-KEM TLS
sed -i 's/^SECURITY_PROFILE=.*/SECURITY_PROFILE=pqc/' .env
cp proxy/Caddyfile.pqc proxy/Caddyfile

docker compose up -d --build
```

Verify it flipped to green:

```bash
curl -sk https://sampledemo.vayunx.com/posture | jq .
# expect: profile "pqc", ML-DSA-65 + SHA-256, status PQC-READY
```

Re-run the VayunX host scan — TLS should now negotiate the hybrid **X25519MLKEM768** key exchange, and the dashboard posture panel reads **PQC-READY 🟢**.

---

## Teardown

```bash
# Stop and remove containers, networks, and volumes
cd vayunx-pqc-demo
docker compose down -v
```

Then, to avoid ongoing AWS charges:

1. **Terminate** the EC2 instance.
2. **Release** the Elastic IP (unassociated EIPs are billed).
3. **Delete** the `sampledemo` A record from DNS.
