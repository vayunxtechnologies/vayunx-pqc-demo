# VayunX PQC demo — one-command deployment helpers.
#
# Linux/macOS (and Git Bash / WSL on Windows) can use these targets.
# Native Windows (PowerShell/cmd) users without `make`: run the underlying
# `docker compose` commands directly — see the comment on each target.

SHELL := /bin/bash
COMPOSE := docker compose

.DEFAULT_GOAL := up
.PHONY: up down logs classical pqc status

# Build + start the whole stack in the background.
# Windows equivalent: docker compose up -d --build
up:
	$(COMPOSE) up -d --build

# Stop and remove containers (keeps named volumes / certs).
# Windows equivalent: docker compose down
down:
	$(COMPOSE) down

# Tail logs for all services.
# Windows equivalent: docker compose logs -f
logs:
	$(COMPOSE) logs -f

# Switch to the CLASSICAL host-TLS profile (pre-quantum) and (re)deploy.
# Ensures proxy/Caddyfile is the classical profile and SECURITY_PROFILE=classical.
# Windows: copy proxy\Caddyfile.classical proxy\Caddyfile (if kept), set
#          SECURITY_PROFILE=classical in .env, then docker compose up -d --build
classical:
	@echo "==> Selecting CLASSICAL TLS profile"
	@# proxy/Caddyfile is the classical profile as checked in; nothing to copy.
	@# Force SECURITY_PROFILE=classical for the app.
	SECURITY_PROFILE=classical $(COMPOSE) up -d --build
	@echo "==> Classical profile active. Host TLS scan should read as pre-quantum."

# Switch to the PQC host-TLS profile (post-quantum ready) and (re)deploy.
# Copies the PQC Caddyfile over the active one, then brings the stack up with
# SECURITY_PROFILE=pqc. This is what flips the HOST TLS scan to PQC-ready.
# Windows: copy proxy\Caddyfile.pqc proxy\Caddyfile, set SECURITY_PROFILE=pqc
#          in .env, then docker compose up -d --build
pqc:
	@echo "==> Selecting PQC (hybrid X25519MLKEM768) TLS profile"
	cp proxy/Caddyfile.pqc proxy/Caddyfile
	SECURITY_PROFILE=pqc $(COMPOSE) up -d --build
	@echo "==> PQC profile active. Host TLS scan should read as PQC-ready."

# Show container status.
# Windows equivalent: docker compose ps
status:
	$(COMPOSE) ps
