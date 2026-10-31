# Architecture

## Purpose

Lifebot is a personal assistant running on a single AWS Lightsail instance, designed to remain portable to another VPS or a home lab. Fitness is its first integration module. See the [product plan](product-plan.md) for the agreed scope and permission model.

## Initial design

```text
User -> messaging platform -> Hermes gateway -> Hermes agent -> model provider
                                                  |
                                            tools and skills
                                                  |
                                      persistent state on Lightsail
```

The model provider is OpenAI Codex using the user's ChatGPT subscription through Hermes's device-code OAuth flow; the configured model is `gpt-6.1-terra`. Discord is the primary interface, with WhatsApp planned as a secondary interface. The deployment uses a native Linux installation with Hermes managing its gateway service through systemd.

The TypeScript CDK app provisions the instance through CloudFormation. Blueprint, bundle, instance name, SSH source CIDR, and key-pair selection are stack parameters. See [CDK deployment](cdk-deployment.md). Hermes installation and configuration follow provisioning.

## Ownership

| Component | Owner / location |
| --- | --- |
| Agent runtime and gateway | Upstream Hermes Agent |
| Lifebot documentation and future customizations | This repository |
| Compute and persistent disk | AWS Lightsail |
| Credentials, sessions, and memory | Hermes data directory on the instance |

Hermes uses `~/.hermes` for user data on a default Linux installation. `HERMES_HOME` can override that location. Keep runtime state outside this checkout and plan backups before storing important personal data.

## Decisions still needed

- WHOOP application/OAuth configuration and the daily brief schedule.
- WhatsApp connection method and scope.
- Food preferences, recipe collection, and selected YouTube channels.
- Details of additional integrations, as concrete use cases are selected.
- Backup destination, retention, and restore procedure.

## References

- [Hermes installation and data layout](https://hermes-agent.nousresearch.com/docs/getting-started/installation).
- [Hermes messaging gateway](https://hermes-agent.nousresearch.com/docs/user-guide/messaging).
