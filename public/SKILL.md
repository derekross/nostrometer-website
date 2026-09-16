---
name: nostr-app-listing
description: Publish this app's NIP-89 listing (kind 31990) so Nostr app directories can find it and Nostrometer can measure and rate it. Use when someone says "submit our app to Nostrometer", "submit to NostrHub", "get our app listed on Nostr", "publish our app listing", or asks why their app is missing from a Nostr app directory.
---

# Submit this app to the Nostr app directories

You are working inside a developer's own repository. Your job is to help them publish one signed
Nostr event describing their app, and to verify it landed. Everything in this file is executable;
when a human is following along, the same commands apply.

Last updated 2026-09-16. Canonical copy: https://nostrometer.com/SKILL.md

## What this actually does

There is no submission form and no queue to join. An app announces itself with a **kind 31990
handler event** (NIP-89) published to public relays. Every directory then discovers it by
crawling: NostrHub, Nostrometer, nostrapp.link and anything else that reads the protocol. One
event, published once, is the submission to all of them.

Nostrometer additionally measures the app's real usage and rates it NIP-by-NIP. Both of those
need the listing to exist first, because ratings attach to the listing's address.

---

## Read this before running anything

### The key rules

Publishing needs the app's secret key. Follow these in order.

1. **Prefer never handling the key at all.** Prepare the event as a file, then have the developer
   run the publish command themselves and paste their key into nak's own prompt:

   ```sh
   # the DEVELOPER runs this, not you, and not until they have approved the event
   nak event --prompt-sec --confirm < listing.json \
     wss://relay.ditto.pub wss://nos.lol wss://relay.damus.io wss://nostr.mom
   ```

   nak reads the key from a terminal prompt. It never appears in an argument, in your transcript,
   or anywhere you can see. `--confirm` makes nak ask once more before it sends.
   **This is the recommended path. Offer it first.**

2. **A `bunker://` URL** (NIP-46) is acceptable if they would rather you ran the command. It is
   revocable, unlike a raw key, and it goes in the same `--sec` flag:

   ```sh
   nak event --sec 'bunker://...' --confirm < listing.json \
     wss://relay.ditto.pub wss://nos.lol wss://relay.damus.io wss://nostr.mom
   ```

   The signing happens in their signer; they approve it there. `--sec` is fine for a bunker URL.
   It is never fine for an nsec.

3. **Never put an `nsec` on the command line.** `--sec nsec1...` writes the key into shell
   history, into the process list, and into the log of this session. If the developer offers one
   that way, say why it is a bad idea and point at `--prompt-sec`.

**If `--prompt-sec` fails**, nak will say it *"can't prompt for a secret key when processing data
from a pipe on this system"* and suggest `--sec` or an environment variable. That happens when
there is no terminal: CI, a container without a TTY, some editor tasks. **Do not take nak's
suggestion and switch to `--sec <nsec>`.** Run it in a real terminal, or use a bunker.

Never write a key to a file. Never print one. Never commit one. If a key is exposed at any point,
say so plainly and tell them to rotate it.

### Do not publish anything the developer has not read

You build the event. They read it and approve it. They publish it, or explicitly ask you to.
A published listing is public and permanent, and a wrong one is awkward to walk back.

### Keep the `< /dev/null` on every read command

`nak` takes filters and values from standard input when it can. Run `nak req` or `nak encode`
from a script or an agent, where stdin is open but idle, and it waits for input that never
arrives instead of returning. It looks exactly like an unresponsive relay.

Every command below that talks to a relay, plus `nak encode`, redirects stdin from `/dev/null`
for that reason. Do not tidy it away. `nak decode` takes its argument positionally and does not
block, and the `nak event ... < listing.json` commands already have stdin pointed at the file.

### Check for nak

```sh
command -v nak || echo "nak not installed"
```

If it is missing, give them the right line and **stop until they have run it.** Do not install it
yourself; this is their machine.

```sh
# Go toolchain
go install github.com/fiatjaf/nak@latest
# macOS, Homebrew
brew install nak
# or a prebuilt binary
# https://github.com/fiatjaf/nak/releases
```

---

## Step 1 — Which key will the app be known by?

Ask the developer for the **npub** the app should publish under. An npub is public; it is safe to
paste.

This matters more than it looks:

- Ratings, reviews and directory entries all bind to `31990:<pubkey>:<d>`. The key is half of the
  app's permanent address.
- Only the key that published a listing can ever update it. If someone else listed the app, the
  developer cannot correct that entry, only publish their own.
- Signing with a different key than a previous listing used creates a **second, separate app**
  with an empty rating history.

**If they do not have a key for the app yet**, that is the normal case for a first listing. Lay
out the choice rather than picking for them:

- **A new key for the app.** `nak key generate` prints a fresh secret and its public half. Clean
  separation between the app's identity and any person's. They must back it up somewhere real
  before publishing anything, because losing it means losing the ability to update the listing
  forever. Have them run it themselves so you never see the secret.
- **Their existing personal key.** Works immediately, no new secret to look after. The cost is
  that the app and the person become the same identity on Nostr.

Whichever they pick is the app's permanent address. Say that out loud before they choose.

Convert the npub for the queries in the next step:

```sh
nak decode npub1...
```

## Step 2 — Is there already a listing? (do not skip this)

```sh
nak req -k 31990 -a <hex-pubkey> -l 20 < /dev/null \
  wss://relay.ditto.pub wss://nos.lol wss://relay.damus.io wss://nostr.mom
```

**Kind 31990 is addressable.** Publishing one replaces the previous event with the same
`(kind, pubkey, d)` completely. It is not a merge. If you build a clean event and publish it, every tag
the old listing carried is gone: the NIPs it claimed, the platform links, the repo reference, the
Zapstore link.

So:

- **A listing came back.** Start from its tags. Keep its `d` tag exactly. Add and correct; delete
  only what the developer explicitly wants gone.
- **Nothing came back, and every relay answered.** This is a new listing. Choose a stable `d`, a
  slug like `my-app`, and never change it afterwards. It only has to be unique for this key, so
  it does not matter if another developer uses the same word.
- **Any relay did not answer.** Stop and retry later. Do not assume "no listing" from a failed
  query; that assumption is how a good listing gets erased.

**Check that last point rather than assuming it.** nak exits 3 only when *every* relay failed. A
partial failure exits 0 with empty output, which looks exactly like "no listing exists" — and the
relay that was down may have been the one holding it. nak prints one line per relay to stderr:

```
connecting to relay.ditto.pub... ok.
connecting to relay.example... lookup relay.example: no such host
```

Treat any relay that did not print `ok.` as unanswered, and retry before concluding anything.

Also search by name, in case someone else listed the app already:

```sh
nak req -k 31990 -l 500 < /dev/null wss://relay.ditto.pub | grep -iF "<app name>"
```

This is a rough sweep, not a guarantee: it caps at 500 events from one relay, and it matches the
name anywhere in the raw JSON, so expect both misses and false hits. Use `-F` so a name containing
`+`, `.` or brackets is matched literally. If you get exactly 500 results you have hit the cap and
have not seen everything.

If a listing exists under a key that is not theirs, tell them. Their own listing will be the
authoritative one going forward, but the ratings on the old entry will not move across.

## Step 3 — Gather the facts from this repository

You are already in the repo. Read it rather than asking questions you can answer yourself.
Good sources: `package.json`, `README`, `zapstore.yaml`, `app.json`, `Info.plist`,
`AndroidManifest.xml`, `manifest.webmanifest`, the landing page, and the source itself.

Collect:

| Fact | Notes |
|---|---|
| Name | What users call it. This exact string matters later for usage counting. |
| Description | One sentence. Not a paragraph. |
| Website | The canonical URL. |
| Icon | An `https://` URL to a square image, already hosted. |
| Platforms | web, ios, android, desktop, linux, macos, windows. |
| Kinds it can handle | Event kinds the app can open and display. |
| NIPs it implements | See the warning below. |
| Repo URL | If public. |

**On NIP claims: verify each one in the code.** Every NIP listed is a public claim, and
Nostrometer's whole purpose is that someone reads the source and tests it. A list copied from a
README or from `zapstore.yaml` is usually optimistic. If you cannot find an implementation, leave
it out and say which ones you dropped. An honest short list beats a long one that falls over.

**On kinds:** a `k` tag means "this app can handle events of this kind", not "this app emits
them". Leave out protocol plumbing such as 22242 (relay auth), 24133 (NIP-46 transport) and
13194 (wallet info).

## Step 4 — Build the event

Write `listing.json` as a **partial** event. Leave out `pubkey`, `created_at`, `id` and `sig`;
nak fills those in at signing time.

Write it **outside the repository**, somewhere like `/tmp/listing.json`, and delete it when you
are done. It is scratch, it is not the developer's code, and it should never end up in a commit.

```json
{
  "kind": 31990,
  "content": "{\"name\":\"Your App\",\"about\":\"One sentence about what it does.\",\"picture\":\"https://yourapp.example/icon.png\",\"website\":\"https://yourapp.example\"}",
  "tags": [
    ["d", "your-app"],
    ["alt", "NIP-89 handler: Your App"],
    ["k", "1"],
    ["k", "30023"],
    ["i", "https://github.com/nostr-protocol/nips/blob/master/01.md"],
    ["i", "https://github.com/nostr-protocol/nips/blob/master/23.md"],
    ["web", "https://yourapp.example/<bech32>"],
    ["t", "social"]
  ]
}
```

Note that `content` is a **JSON string**, not a nested object. It holds kind-0 style metadata.

### Tag reference

| Tag | Shape | Notes |
|---|---|---|
| `d` | `["d", "your-app"]` | The app's permanent identifier. Never change it. |
| `alt` | `["alt", "NIP-89 handler: Your App"]` | NIP-31 human-readable fallback. |
| `k` | `["k", "1"]` | One per kind the app can handle. Numbers as strings. |
| `i` | `["i", "https://github.com/nostr-protocol/nips/blob/master/17.md"]` | One per implemented NIP. Two-digit, uppercase for hex NIPs (`7D.md`). Not defined by NIP-89: this is the convention NostrHub and Nostrometer read NIP claims from. |
| platform | `["web", "https://yourapp.example/<bech32>"]` | One per platform. `<bech32>` is a literal placeholder a client substitutes with the entity to open. Use a real deep link if the app has one, for example `["android", "intent:<bech32>#Intent;scheme=nostr;package=com.example.app;end"]`. If the app has separate routes per entity type, NIP-89 allows a third value to scope it: `["web", "https://…/p/<bech32>", "nprofile"]`. A platform with no URL at all, such as a desktop binary, is better left out than given a made-up one. |
| `t` | `["t", "social"]` | Category. Common: social, messaging, media, tools, zaps, communities, marketplace, relay, dvm. |
| `a` (repo) | `["a", "30617:<pubkey>:<repo-d>", "wss://relay.ngit.dev/"]` | NIP-34 repo announcement, if one exists. See the optional steps. |
| `a` (Zapstore) | `["a", "32267:<pubkey>:<app-id>", "wss://relay.zapstore.dev/"]` | Zapstore listing, if one exists. |

A plain repository URL has no tag of its own. Put it in the `content` JSON as `"repository"`, and
use the `a` tag above only for a real NIP-34 announcement.

## Step 5 — Show it to the developer

Print the event. Walk through it in plain language: what each claim says, which NIPs you included
and why, and anything you left out. If this replaces an existing listing, show what changed and
confirm nothing was dropped by accident.

Check the shape before they sign, which costs nothing and catches typos:

```sh
nak event --no-sign -a <hex-pubkey> < listing.json
```

That prints the event with `pubkey` and `created_at` filled in and signs nothing. Confirm the
tags and content survived intact.

**Wait for their approval.**

## Step 6 — Publish

```sh
# the DEVELOPER runs this and pastes their key at the prompt
nak event --prompt-sec --confirm < listing.json \
  wss://relay.ditto.pub wss://nos.lol wss://relay.damus.io wss://nostr.mom
```

`--confirm` makes nak show the finished event and ask before it sends. If they are using a
bunker instead, swap `--prompt-sec` for `--sec 'bunker://...'` and approve it in their signer.

nak prints the signed event as it publishes. **Check its `pubkey` against the one from Step 1
before you do anything else.** If they differ, a different key was pasted, and what just went out
is a second app with no rating history rather than an update to theirs. Say so immediately.

`relay.damus.io` rate-limits aggressively. If it answers `rate-limited` or `banned`, that relay
alone rejected the event; the others still have it. Wait a minute and retry just that one rather
than republishing to everything.

## Step 7 — Verify, and hand over the address

Read it back:

```sh
nak req -k 31990 -a <hex-pubkey> -d <your-d-tag> < /dev/null wss://relay.ditto.pub wss://nos.lol
```

Get the app's permanent address:

```sh
nak encode naddr -k 31990 -p <hex-pubkey> -d <your-d-tag> < /dev/null
```

Give it a few seconds first; relays index on their own schedule.

**If nothing comes back**, work through it in this order rather than republishing blindly: the
`pubkey` in the query is the one that actually signed (Step 6); the `d` matches the event exactly;
the relay you are asking is one of the ones that accepted it. Republishing is harmless, but so is
finding out why first.

Give the developer the naddr and these links:

- `https://nostrhub.io/<naddr>` — the app's page in the directory
- `https://nostrometer.com/app/<naddr>` — its interoperability report, once it has ratings
- `https://njump.me/<naddr>` — the raw event

Directories pick the listing up within a minute or two.

---

## Optional, after the listing exists

Offer each of these. Any of them can be declined; the listing alone is enough to be discovered
and rated.

### Get the app's usage counted

Nostrometer ranks apps by distinct monthly authors, counted from the `client` tag on events the
app publishes. No tag means the app reports as zero, and zero sorts last.

```json
["client", "Your App", "31990:<your-pubkey>:your-app", "wss://relay.ditto.pub"]
```

**The first value has to match exactly.** It is matched case-sensitively against one of three
strings derived from the listing: the `name` verbatim, the `name` lowercased, or the website's
hostname without a leading `www.`. A tag reading `"Your App Web"` or `"your-app"` when the name is
`"Your App"` counts as zero.

Find where the app signs events and **propose the change as a diff**. Do not edit their
publishing code yourself; it is theirs, and the tag has privacy consequences.

Those consequences are the reason NIP-89 says a client SHOULD let users opt out of the tag: it
tells every relay and every reader which software a person uses. Include the opt-out in what you
propose. Apps have already been marked down on Nostrometer for shipping the tag without one.

### Announce the repo on Nostr

If the app is open source, `ngit` publishes a kind 30617 repo announcement, which makes the
repository addressable from Nostr. The listing, the reviews and any issues filed about the app
then all resolve to the same code without leaving the protocol.

```sh
# the DEVELOPER runs this, in their repo, in a real terminal
ngit init
```

**Three things to tell them before they run it, and reasons not to run it yourself:**

- **It publishes immediately.** Unlike everything above, there is no draft to review first. It
  signs and sends a kind 30617 announcement under their key.
- **It is interactive by default.** It asks questions. Launched by an agent it will simply hang,
  and the `< /dev/null` rule from earlier does not rescue it: that would answer its prompts with
  end-of-file rather than with answers.
- **Every key rule above applies to it too.** `ngit` offers `--nsec` on the command line, which is
  the same mistake as `nak --sec nsec1...` for the same reasons. It also accepts `--nbunksec`.

A bare `ngit init` configures GRASP servers to host the git data by default. If they only want
the announcement and want their code to stay exactly where it lives, pass `--grasp-server ""`.

Afterwards, add the repo's address to the listing as an `a` tag and republish it.

See https://gitworkshop.dev/ngit

### Ask for a NIP-by-NIP review

Reviews are worked in waves, ordered by usage. To join the queue, open an issue at
https://github.com/derekross/nostrometer with the app's naddr, or message Derek on Nostr:
`npub18ams6ewn5aj2n3wt2qawzglx9mr4nzksxhvrdc4gzrecw7n5tvjqctp424`

---

## Mistakes that are expensive to undo

- **Publishing without reading the existing listing first.** The replacement wipes every tag the
  old one had. Step 2 exists for this.
- **Changing the `d` tag.** Every rating ever published about the app points at the old address.
  A new `d` is a new app with no history.
- **Signing with a different key.** Same outcome: a second entry, empty rating history, and the
  old one is not yours to fix.
- **Claiming NIPs the app does not implement.** Somebody reads the source and tests it. An
  inflated list turns into a row of low tiers.
- **Putting an nsec in a shell command.** Shell history, process list, session transcript.

## Relays used here

```
wss://relay.ditto.pub
wss://nos.lol
wss://relay.damus.io
wss://nostr.mom
```

## Reference

- NIP-89, handler information and the client tag: https://github.com/nostr-protocol/nips/blob/master/89.md
- NIP-34, git repositories: https://github.com/nostr-protocol/nips/blob/master/34.md
- nak: https://github.com/fiatjaf/nak
- How the ratings work: https://nostrometer.com/methodology
- The human version of this guide: https://nostrometer.com/developers
