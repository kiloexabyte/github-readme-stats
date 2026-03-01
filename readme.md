# GitHub Readme Stats

Dynamically generated GitHub stats for your profile README.

## Card Types

| Card | Endpoint |
| --- | --- |
| Stats | `/api?username=` |
| Top Languages | `/api/top-langs?username=` |
| Repo Pin | `/api/pin?username=&repo=` |
| Gist Pin | `/api/gist?id=` |
| WakaTime | `/api/wakatime?username=` |

## Usage

Deploy your own instance (see below), then add to your README:

```md
![GitHub Stats](https://your-vercel-instance.vercel.app/api?username=kiloexabyte)
```

## Customization

All endpoints accept query parameters for customization:

- `theme` - named theme (e.g. `dark`, `radical`, `tokyonight`)
- `title_color`, `text_color`, `icon_color`, `bg_color`, `border_color` - hex colors
- `hide_border` - remove card border
- `locale` - language code (e.g. `en`, `fr`, `de`)
- `cache_seconds` - cache duration (min 14400)

Card-specific options vary — see the source in [`src/cards/`](src/cards/) for details.

## Self-Hosting

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kiloexabyte/github-readme-stats)

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens/new?scopes=read:user) with `read:user` scope
2. Add it as the `PAT_1` environment variable in your Vercel project settings
3. Deploy

Multiple tokens can be provided as comma-separated values (`PAT_1`, `PAT_2`, etc.) for higher rate limits.

## Development

```sh
bun install
bun test
bun dev    # starts vercel dev server
```

## Credit

Forked from [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats).
