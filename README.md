# Lifebot

A personal assistant powered by [Nous Research's Hermes Agent](https://github.com/NousResearch/hermes-agent), intended to run continuously on an AWS Lightsail instance.

Life Bot covers daily life, with fitness as its first integration module. The [product plan](docs/product-plan.md) records the agreed scope, permission model, and milestones: WHOOP first, Gmail and Google Calendar as early integrations, then food and recipe scouting, with WhatsApp and broader integrations to follow.

This repository holds Lifebot's AWS CDK infrastructure, project documentation, and future customizations. Hermes provides the agent runtime, sessions, memory, tools, and messaging gateway.

## Project setup

Local requirements: Node.js 24, npm, Git, and GNU Make. Deployment requires AWS credentials; AWS CLI installation is optional.

```bash
npm ci
make check
npm test
npm run synth
```

The project includes:

- [Architecture and project boundaries](docs/architecture.md).
- [Lightsail setup guide](docs/lightsail-setup.md).
- Git exclusions for credentials, runtime state, and local artifacts.
- Shared editor settings and contributor instructions.
- A TypeScript CDK v2 app in `bin/` and a Lightsail stack in `lib/`.
- Infrastructure tests in `test/` and pinned dependencies in `package-lock.json`.
- A Node.js setup script at `scripts/setup-instance.mjs`, run from your laptop over SSH, with an interactive `--configure` mode for Hermes and its gateway.

## Infrastructure

The stack creates one Lightsail instance. Defaults are `lifebot`, Ubuntu 24.04 (`ubuntu_24_04`), and bundle `small_3_1`. SSH is the only inbound port and requires an explicit IPv4 CIDR. You can supply an existing Lightsail key pair or use the regional default.

The deployment region is Mumbai (`ap-south-1`), the closest supported Lightsail region to Dubai. The account comes from your AWS credentials.

The model provider will use your ChatGPT subscription through Hermes's OpenAI Codex OAuth flow. Run `npm run setup:instance -- --configure` from your laptop and select **ChatGPT or Codex Subscription** in the model wizard. No OpenAI API key is needed for that provider.

See [CDK deployment](docs/cdk-deployment.md) for region selection, bundle verification, and deployment commands. Hermes installation remains a separate step after provisioning.

Copy `.env.example` to `.env` and fill in `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `SSH_ALLOWED_CIDR` (your public IPv4 address with `/32`). The npm CDK commands load this file automatically; existing shell variables take precedence. `.env` is ignored by Git. An existing AWS profile is also supported as an alternative. Run `npm run deploy` to deploy using these settings.

## Next steps

1. Verify persistent memory across a fresh Discord session.
2. Implement read-default/write-on-explicit-request rules in the runtime and integration boundaries.
3. Add a read-only WHOOP integration and custom Hermes skill.
4. Connect Gmail and Google Calendar with read-only OAuth permissions.
5. Build the food/preferences files and approval-based Sunday recipe scout.

The Lightsail instance and Hermes are running in Mumbai, with subscription OAuth and Discord conversations working. See [deployment notes](docs/deployment-notes.md) for the verified details and the [setup guide](docs/lightsail-setup.md) for rebuilding the runtime.
