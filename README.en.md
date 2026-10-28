# Brand Studio

![Sidebar result](docs/sidebar.png)

A small plugin that replaces the brand block at the top of the DeepSeek Harness sidebar: your
avatar, your name, and optionally the official HARNESS badge.

The official fish plus "DeepSeek Harness" is one single wordmark image, and after a while it
did not feel like mine. So I wrote this. It touches nothing outside that one block, and its
settings do not take a menu entry of their own — they sit inside **Settings → General**.

## What it can change

- **Avatar**: the signed-in DeepSeek account picture, an uploaded image, or the official mark.
- **Shape**: circle or rounded square.
- **Name**: anything you like; empty keeps the official DeepSeek Harness.
- **Harness badge**: custom names only — whether the official HARNESS badge follows the name.

![Settings rows](docs/settings.png)

## How it behaves

The official wordmark draws "DeepSeek" and "Harness" in one image, so it cannot be split. While
the name is empty the badge switch is locked and the official logo renders untouched; the switch
only becomes meaningful once you type your own name.

A signed-out account, an account without a picture, or "Uploaded image" with nothing stored all
fall back to the official mark instead of leaving an empty cell.

Only the uploaded picture can be changed or removed here. The account picture belongs to the
account, the official mark belongs to the build, and neither is editable from this page.

Settings live in the browser's `localStorage` (`dsh.custom-brand.v1`), so another machine means
setting them up again. Uploaded pictures are centre-cropped to 192×192 before storage, so they
do not exhaust the quota.

## Install

1. Open **Plugins** in the sidebar and click **Add plugin**.
2. Paste the repository address: `https://github.com/elliotmasheal/dsh-brand-studio`
3. Enable `dsh-brand-studio` if it did not enable itself, then refresh the page.
4. Open **Settings → General** and scroll down: five brand rows mean it worked.

If the repository is still private, the installing machine needs access to it; once it is public
the address is enough.

To remove it, uninstall the bundle. The brand block snaps back to the official one immediately —
nothing official was modified, the plugin only borrows the slot while it has something to show.

## How it works

Three official slots, nothing else:

- `sidebar.brand.mark` / `sidebar.brand.name`: occupied only while there is something to show
  (priority `-1`, above the official occupant), released otherwise.
- `settings.general.item`: the five rows, appended to the General page rather than a page of
  their own.

The avatar comes from `ctx.remote.account`: it watches the sign-in state, calls `getProfile` for
`avatarUrl`, and shows the picture only after the browser actually decoded it — no empty flash.

The UI uses theme tokens only and imports no Harness client package, so light and dark both work.

## Known issues

- The HARNESS badge glyphs were taken from the 0.2.1-rc.3 wordmark; a rebrand upstream means
  updating them.
- Settings are local to this machine and disappear with site data.
- Mutually exclusive with other plugins that also occupy `sidebar.brand.*`.
- The 1px layout shift of the Windows caption bar is compensated specifically; other platforms
  may need another look.

## Development

Edit `client.js` and it hot-reloads. At minimum:

```sh
node --check client.js
```

Conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT, see [LICENSE](LICENSE).

Unofficial community plugin, not affiliated with DeepSeek. DeepSeek and DeepSeek Harness are
trademarks of their owner; the HARNESS badge glyph geometry is reproduced only for visual
fidelity and is not covered by the MIT grant — see [NOTICE](NOTICE).
