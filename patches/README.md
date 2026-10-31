# Hermes compatibility patches

`hermes-discord-slash-auth.patch` fixes a reproduced Hermes v0.22.5 startup-order bug: `adapter_slash_auth.py` can import before the optional Discord dependency is adopted and retain `discord = None`. Native slash commands then fail with `AttributeError: 'NoneType' object has no attribute 'DMChannel'`, while ordinary chat works.

The patch resolves `discord` inside the authorization method after the runtime dependency is available. It does not bypass user or channel authorization. A regression harness reproduced the unpatched failure and verified allowed users, rejected users, missing users, allowed/blocked channels, and allowed/rejected DM users after the patch.

The Node setup script applies it only to v0.22.5, skips it when already applied, and restarts an active gateway when it changes the file. A context mismatch stops setup for review rather than overwriting an unexpected upstream version. Reassess this patch when upgrading Hermes; it is a local modification to the upstream checkout.

Upstream report: [NousResearch/hermes-agent #137083](https://github.com/NousResearch/hermes-agent/issues/137083).
