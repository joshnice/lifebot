# Lifebot

A personal assistant powered by [Nous Research's Hermes Agent](https://github.com/NousResearch/hermes-agent), intended to run continuously on an AWS Lightsail instance.

This repository holds Lifebot's project documentation and will hold its deployment configuration and customizations. Hermes provides the agent runtime, sessions, memory, tools, and messaging gateway.

## Project setup

Local requirements: Git and GNU Make. No application dependencies are required at this stage.

```bash
make check
```

The initial project foundation includes:

- [Architecture and project boundaries](docs/architecture.md).
- [Lightsail setup guide](docs/lightsail-setup.md).
- Git exclusions for credentials, runtime state, and local artifacts.
- Shared editor settings and contributor instructions.

## Next steps

1. Identify the Lightsail instance, OS, region, and SSH access.
2. Install Hermes on the instance and select a model provider.
3. Connect a messaging platform and enable the gateway service.
4. Add Lifebot's instructions, skills, and integrations as requirements become clear.

No cloud resources have been created and no Hermes runtime is installed by this repository yet. See the setup guide for the manual deployment procedure.
