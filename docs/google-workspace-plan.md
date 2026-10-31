# Gmail and Google Calendar integration

Status: requested for the initial integration phase; not connected yet.

## Approach

Hermes ships a `google-workspace` skill at `~/.hermes/skills/productivity/google-workspace/`. Its OAuth credentials belong to the instance's Hermes profile, separately from AWS deployment credentials and ChatGPT model authentication.

The installed v0.22.5 setup script was inspected on 2026-10-31. Its default `SCOPES` list includes Gmail send/modify, full Calendar, and additional Workspace write permissions. Do not run the stock authorization flow unchanged for Life Bot's initial read-only integration. Narrow the requested and validated scopes before generating a consent URL, and review the read operations for side effects. Newer online documentation can differ from the installed release.

## Initial OAuth scopes

- `https://www.googleapis.com/auth/gmail.readonly`: search/read mail without sending, label changes, or marking messages read.
- `https://www.googleapis.com/auth/calendar.readonly`: read calendars and events without changing them.

Do not request Drive, Contacts, Sheets, Docs, or write scopes as part of this initial connection. Saved mailbox drafts are external writes even if unsent; suggestions written in a Discord response are not saved Gmail drafts.

## Connection prerequisites

1. Use a Google Cloud project dedicated to Life Bot or a suitable existing project.
2. Enable the Gmail API and Google Calendar API.
3. Configure the OAuth consent screen and add the intended Google account as a test user if the app is in testing.
4. Create a Desktop app OAuth client and download its client JSON outside this repository.
5. Prepare the read-only Hermes integration, then complete Google's browser consent flow using that client.
6. Keep client credentials and refresh tokens in the private Hermes data directory. Protect offline access and review Google's testing-mode token expiry before relying on recurring jobs.

Managed Workspace accounts may need administrator approval. Account choice and OAuth client registration still need to be completed by the user. No Google project or client was created while recording this plan.

## Verification

Verify an explicitly requested mailbox search and event listing, including timezone handling. Confirm that viewing an unread email leaves it unread and event queries leave calendars unchanged. Keep message bodies and event details out of repository test fixtures and logs.

Any future write path must check explicit authorization for the particular action. Request broader consent only for capabilities the user chooses to enable. Test that unrequested sends, draft creation, message modifications, event changes, invitations, and RSVPs are blocked.

## References

- [Hermes Google Workspace skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/google-workspace).
- [Gmail OAuth scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).
- [Calendar OAuth scopes](https://developers.google.com/workspace/calendar/api/auth).
