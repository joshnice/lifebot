# Architecture

## Purpose

Lifebot is a personal assistant running on a single AWS Lightsail instance. Its capabilities and communication channel will be selected incrementally.

## Initial design

```text
User -> messaging platform -> Hermes gateway -> Hermes agent -> model provider
                                                  |
                                            tools and skills
                                                  |
                                      persistent state on Lightsail
```

The messaging platform and model provider are still to be chosen. The initial deployment approach is a native Linux installation with Hermes managing its gateway service through systemd.

## Ownership

| Component | Owner / location |
| --- | --- |
| Agent runtime and gateway | Upstream Hermes Agent |
| Lifebot documentation and future customizations | This repository |
| Compute and persistent disk | AWS Lightsail |
| Credentials, sessions, and memory | Hermes data directory on the instance |

Hermes uses `~/.hermes` for user data on a default Linux installation. `HERMES_HOME` can override that location. Keep runtime state outside this checkout and plan backups before storing important personal data.

## Decisions still needed

- Existing or new instance, AWS region, Linux distribution, and instance size.
- Model provider and model.
- Primary messaging platform and permitted users.
- Initial assistant responsibilities and integrations.
- Backup destination, retention, and restore procedure.

## References

- [Hermes installation and data layout](https://hermes-agent.nousresearch.com/docs/getting-started/installation).
- [Hermes messaging gateway](https://hermes-agent.nousresearch.com/docs/user-guide/messaging).
