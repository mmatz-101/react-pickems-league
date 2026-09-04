# Pickems deployment

This directory contains a systemd service and Caddy reverse-proxy template for a Hostinger VPS. The frontend is deployed by Vercel; the backend is a persistent PocketBase service.

## Database and `pb_data`

PocketBase stores all application data in `pb_data/`, especially `pb_data/data.db`. **Never commit, upload, or deploy this directory through GitHub Actions.** It is production state, not source code.

- The service's `WorkingDirectory` is the deployment path, so PocketBase creates/uses `$DEPLOY_PATH/pb_data/`.
- Create one independent database per environment. Staging must never share or overwrite production `pb_data`.
- Back up staging and production with a consistent SQLite backup (or PocketBase backup) before deployment. Include the SQLite WAL/SHM files when copying a stopped instance; do not copy only `data.db` from a live database.
- To seed staging, stop the staging service, copy a sanitized backup into the staging `pb_data/` directory, then start the service. Do not place real user data in staging unless you have a privacy-approved process.

## First-time VPS setup

The examples use `/opt/pickems-staging`, the `pickems` Linux user, and port `8090`. Use a different directory/service/environment file for production.

1. Create a non-login service account and directories:

   ```bash
   sudo useradd --system --home /opt/pickems-staging --shell /usr/sbin/nologin pickems
   sudo mkdir -p /opt/pickems-staging/{bin,pb_migrations,pb_data} /etc/pickems
   sudo chown -R pickems:pickems /opt/pickems-staging
   ```

2. Create `/etc/pickems/staging.env` (permissions `600`, owned by root):

   ```bash
   # Keep staging data stable and avoid polling the sports provider by default.
   DISABLE_SCHEDULER=true
   ```

   Set `DISABLE_SCHEDULER=false` only when you explicitly want staging to run the live game/odds and results scheduler.

3. Install `deploy/systemd/pickems-backend.service` as `/etc/systemd/system/pickems-backend.service`. Update its deployment path and environment-file name if needed, then run:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now pickems-backend
   ```

4. Install Caddy, replace `pickemsleague.example` in `deploy/caddy/Caddyfile` with your actual domain, and add matching DNS `A` records for `api-staging` and `api`. Caddy obtains and renews TLS certificates automatically once DNS points at the VPS.

## GitHub Actions deployment

`.github/workflows/deploy-backend.yml` deploys pushes to `staging` to the GitHub **staging** environment and pushes to `main` to **production**. Configure these environment secrets independently:

| Secret | Value |
|---|---|
| `SSH_HOST` | VPS hostname or IP |
| `SSH_USER` | SSH deployment user (must be able to run `sudo systemctl restart pickems-backend` without a password) |
| `SSH_PRIVATE_KEY` | Private deploy key |
| `SSH_KNOWN_HOSTS` | Output of `ssh-keyscan -H YOUR_VPS_HOST` reviewed before saving |
| `DEPLOY_PATH` | `/opt/pickems-staging` for staging, `/opt/pickems` for production |
| `SYSTEMD_SERVICE` | `pickems-backend` for staging, `pickems-backend-production` for production |

The workflow uploads only the compiled backend binary and JavaScript migrations. It intentionally never touches `pb_data/`.

Create the production service as a second unit (for example `pickems-backend-production.service`) with its own deployment path, `pb_data/`, and environment file. The workflow chooses it through the production `SYSTEMD_SERVICE` secret.

## Vercel environment variables

For the staging Vercel deployment use:

```text
POCKETBASE_URL=https://api-staging.YOUR_DOMAIN
NEXT_PUBLIC_APP_URL=https://staging.YOUR_DOMAIN
```

Use the production equivalents for the production Vercel deployment. `NEXT_PUBLIC_APP_URL` is used when generating invite links.
