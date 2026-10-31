# Lifebot

A personal assistant powered by [Nous Research's Hermes Agent](https://github.com/NousResearch/hermes-agent), intended to run continuously on an AWS Lightsail instance.

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

1. Identify the Lightsail instance, OS, region, and SSH access.
2. Install Hermes on the instance and select a model provider.
3. Connect a messaging platform and enable the gateway service.
4. Add Lifebot's instructions, skills, and integrations as requirements become clear.

The Lightsail instance is deployed and running in Mumbai. See [deployment notes](docs/deployment-notes.md) for the verified instance details and the Lightsail setup guide to install Hermes.
