# Deployment notes

Verified through the Lightsail API on 2026-10-31 after successful CloudFormation deployment.

| Setting | Value |
| --- | --- |
| Stack | `LifebotStack` |
| Region | Mumbai (`ap-south-1`) |
| Instance | `lifebot` |
| State | Running |
| Blueprint | Ubuntu 24.04 LTS (`ubuntu_24_04`) |
| Bundle | `small_3_1` |
| Resources | 2 vCPUs, 2 GB RAM, 60 GB SSD |
| Plan | $12/month, 1,536 GB transfer, public IPv4 |
| Public IP at verification | `15.206.168.38` (not static) |
| SSH user | `ubuntu` |
| SSH key pair | `LightsailDefaultKeyPair` in Mumbai |
| Firewall | TCP 22 only, restricted to the CIDR configured in `.env`; no IPv6 ingress |

The first attempt used `small_3_0`, which is unavailable in Mumbai. Its stack rolled back with no surviving resources. The failed application stack was removed and recreated with `small_3_1`. The `CDKToolkit` bootstrap stack was preserved.

Hermes Agent v0.22.5 (stable, commit `bf0203a794`) is installed under `/home/ubuntu/.hermes/hermes-agent`, with the CLI at `/home/ubuntu/.local/bin/hermes`. The CLI and web UI build completed successfully. A 2 GB `/swapfile` was added after the first web UI build exceeded physical RAM; it is enabled and persists through `/etc/fstab`. User lingering is enabled for `ubuntu`.

The setup entry point is now Node.js: `npm run setup:instance` on the laptop, using the SSH settings in local `.env`. Its runtime installation and verification path completed successfully against this instance. The earlier uploaded Bash wrapper has been removed.

Subsequent setup verification on 2026-10-31 confirmed `model.provider=openai-codex` and `model.default=gpt-6.1-terra`. The gateway user service is enabled and running, with lingering enabled. Startup reports **No messaging platforms enabled**, so a messaging channel still needs configuration. No inference request was made during this status check; model configuration alone does not verify a successful conversation.

On the instance, use `hermes` for terminal chat, or `hermes gateway setup` to connect a messaging platform. See [Lightsail setup](lightsail-setup.md).

Discord was subsequently connected, and the user confirmed a successful model reply in Discord. Native `/sethome` exposed the v0.22.5 startup-order bug described in [compatibility patches](../patches/README.md). The dependency-resolution patch was applied after reproducing the failure, and seven authorization checks passed. The gateway restarted successfully with the patched source; a live `/sethome` retry is needed to confirm the Discord interaction end to end. No home channel was saved by the failed command.
