# sf-status

Panel de monitoreo de [segundafundacion.com.ar](https://segundafundacion.com.ar) — el sitio vive en [chabaug/segunda-fundacion-web](https://github.com/chabaug/segunda-fundacion-web).

Vivo en: https://chabaug.github.io/sf-status/

## Qué muestra

- Último reporte de los tests BAT y RTS (Playwright) del sitio.
- Tráfico real vía Cloudflare Web Analytics (últimos 30 días).
- Pendientes de tests: por qué hay skips o fallas conocidas.
- Pendientes de la página: contenido/decisiones abiertas del catálogo, eventos, etc.

## Cómo se actualiza

- `data/bat-latest.json` y `data/rts-latest.json` se publican automáticamente desde los workflows `bat-pr-check.yml` y `rts-nightly.yml` del repo del sitio, en cada corrida.
- `data/cloudflare-latest.json` se actualiza solo todos los días a las 09:00 ART (`.github/workflows/update-cloudflare.yml` en este repo), y también se puede disparar a mano desde la pestaña Actions ("Run workflow").
- `data/pendientes.json` y `data/page-todos.json` son curados a mano — se editan directamente cuando cambia el estado real.

## Secrets necesarios (Settings → Secrets → Actions, en este repo)

- `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `CF_WEB_ANALYTICS_SITE_TAG` — mismos valores que `E:\SF\tools\analytics\.env`.

## Secret necesario en el otro repo (segunda-fundacion-web)

- `STATUS_REPO_TOKEN` — token con permiso de escritura sobre este repo, para que sus workflows puedan publicar `bat-latest.json` / `rts-latest.json` acá.
