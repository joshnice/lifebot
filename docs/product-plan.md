# Life Bot product plan

Agreed direction, recorded 2026-10-31. Life Bot is a personal assistant covering daily life. Fitness is its first integration module, within a broader assistant for food, routines, travel, home, and administration.

## Foundation

- Runtime: upstream Hermes Agent on plain Ubuntu 24.04.
- Hosting: AWS Lightsail initially, provisioned with TypeScript AWS CDK. Keep deployment reusable for additional agents.
- Inference: ChatGPT/Codex subscription through Hermes OAuth.
- Interfaces: Discord as the main home base; WhatsApp for quick mobile interactions.
- Portability: preserve the ability to move to another VPS or a home lab without redesigning the assistant.
- Source control: use GitHub for infrastructure, sanitized configuration templates, custom skills, and scripts. Keep secrets and live personal data out of Git.
- Implementation preference: write project setup and integration scripts in Node.js where practical. Hermes itself remains upstream Python software.

## Permission model

External services are read-only by default. Life Bot may search, read, and analyze connected data. A connection, OAuth consent, or an earlier write does not grant blanket permission to change that service.

Writes, sends, deletes, edits, calendar changes, and other external changes require an explicit user request for the particular action. A recurring job that sends messages must be explicitly requested with a defined purpose, destination, and schedule; that authorization applies to the requested job, not arbitrary future sends.

Life Bot may maintain its internal memory and working files autonomously. The curated recipe collection is an explicit exception: recipe scouting produces suggestions, and additions require the user's approval. Unapproved candidates may remain in internal working notes, but must not be treated as accepted recipes.

Use read-only integration scopes where available. Write-capable tools must check for authorization for the requested action. Documenting this policy does not itself enforce it: runtime instructions, connector permissions, and authorization tests need to be implemented and verified before adding integrations.

## Memory

Use Hermes's persistent user and agent memory (`USER.md` and `MEMORY.md`) for durable context. Maintain separate domain files as the relevant modules are introduced: fitness, food, routines, travel, and home/admin.

Keep personal memory and domain data outside this source checkout. Git may hold sanitized templates and code, while private backups carry runtime data. A migration must preserve the agent's configuration, Markdown memory, custom skills, scripts, and required runtime state. Credentials must be transferred privately or reauthenticated.

## Milestones

| Milestone | Scope | Status |
| --- | --- | --- |
| Foundation | VPS → Hermes → OpenAI OAuth → Discord → conversation with persistent memory | VPS, runtime, OAuth, Discord conversation, and home-channel command working; persistent-memory continuity still needs explicit verification |
| Operating rules | Read-default/write-on-explicit-request policy and portable memory layout | Requirements recorded; enforcement and memory verification pending |
| WHOOP | First real integration, through a custom Hermes skill | Planned |
| Gmail and Google Calendar | Early read-only integrations for inbox awareness and schedule context | Planned alongside the initial integration work; accounts not connected yet |
| Food | Recipe/preferences files and Sunday recipe scout | Planned, after WHOOP |
| WhatsApp | Secondary interface for quick mobile interactions | Planned |
| Broader assistant | Other integrations and proactive routines | Later |

### First real integration: WHOOP

Create a custom Hermes skill backed by a read-only WHOOP connector. Start with recovery, sleep, strain, workouts, and recent history. Use those inputs for a daily fitness summary and, once explicitly scheduled, a morning brief to the Discord home channel.

Acceptance: Life Bot can retrieve current and recent authorized WHOOP data, report data freshness and missing information, and produce a grounded summary without modifying WHOOP data. Before scheduling a recurring brief, verify one on-demand summary and agree its timing and destination.

### Food and Sunday recipe scout

Maintain food preferences and an approved recipe collection. The Sunday scout checks user-selected food YouTubers, finds new recipes, compares them with preferences and existing recipes, and sends only worthwhile suggestions. Avoid suggesting the same recipe repeatedly.

Acceptance: the scout explains why each candidate fits, links its source, and identifies relevant recipe overlap. It does not add candidates to the curated collection until the user explicitly approves them. Channel selection, schedule, preferences, and initial recipe sources still need to be specified.

### Gmail and Google Calendar

Connect both as early integrations, using Hermes's bundled Google Workspace capability where it meets the permission model. WHOOP remains the first real integration; Gmail and Calendar no longer belong solely to the later backlog.

Gmail scope: search and read messages, summarize threads, identify follow-ups, and suggest replies in chat. Reading must not mark messages read, archive them, change labels, or create mailbox drafts. Sending, saving drafts, modifying labels, archiving, and deleting require an explicit request for that particular action and an appropriately authorized write path.

Calendar scope: read calendars and events, answer schedule questions, identify conflicts, and provide meeting context. Creating, editing, deleting, moving events, and sending invitations or RSVPs require an explicit request for that particular action.

Start with read-only OAuth scopes. Add write capabilities separately only when the corresponding authorization checks are in place; asking for a write cannot make a read-only token capable of performing it. Connecting accounts is not consent to request all Workspace services or broad write scopes.

Acceptance: verify a user-requested email search and upcoming-event query, preserve message unread state and calendar contents, and verify that unrequested writes are blocked. Any combined inbox/calendar/fitness brief still requires an agreed schedule and destination before automatic delivery. See [Google Workspace integration plan](google-workspace-plan.md).

### Proactive jobs

Planned jobs include the morning WHOOP/fitness brief, Sunday recipe scout, weekly summaries, and reminders. Later, add follow-ups on things the user mentioned but has not revisited. Each external delivery needs a user-authorized job scope, destination, and schedule. Use the user's Dubai timezone (`Asia/Dubai`) for local schedules.

### Later integrations

Drive, GitHub, travel, home/admin, and possibly finance-related data. Each inherits the same read-default/write-on-explicit-request rule. Add integrations incrementally in response to a concrete use case.

## Immediate next work

1. Verify persistent memory across a fresh Discord session with an innocuous fact; do not confuse same-thread history with durable memory.
2. Implement the permission policy in runtime instructions and integration boundaries, including the recipe exception.
3. Build the read-only WHOOP connector and custom Hermes skill, then verify an on-demand summary.
4. Connect Gmail and Google Calendar through read-only OAuth and verify read behavior without mailbox/calendar changes.
5. Agree the daily brief contents, schedule, and destination before enabling that specific job.
6. Build the recipe/preferences foundation before scheduling the Sunday scout.
