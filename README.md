# sf-status

Panel de monitoreo de [segundafundacion.com.ar](https://segundafundacion.com.ar) — el sitio vive en [chabaug/segunda-fundacion-web](https://github.com/chabaug/segunda-fundacion-web).

Vivo en: https://chabaug.github.io/sf-status/

## Qué muestra

- Último reporte de los tests BAT y RTS (Playwright) del sitio.
- Tráfico real vía Cloudflare Web Analytics (últimos 30 días).
- Pendientes de tests: por qué hay skips o fallas conocidas.

Los pendientes de contenido de la página (créditos sin resolver, shows esperando link de entradas, etc.) son trackeo interno y NO se publican acá. Desde 2026-09-05 viven en el panel de admin del sitio (`/admin` → Estado del sitio), guardados en Netlify Blobs detrás del token de admin; `E:\SF\internal\pendientes_pagina.json` queda como la copia original desde la que se migraron (`E:\SF	ools\seed_pendientes.js`).

## Cómo se actualiza

- `data/bat-latest.json` y `data/rts-latest.json` se publican automáticamente desde los workflows `bat-pr-check.yml` y `rts-nightly.yml` del repo del sitio, en cada corrida.
- `data/bat-history.json` y `data/rts-history.json` los escriben esos mismos workflows: van acumulando una corrida por vez (se guardan las últimas 30). Los consume el panel de admin del sitio (`segundafundacion.com.ar/admin` → Tests → "Ver últimas 10 corridas"), no este dashboard.
- `data/coverage-latest.json` lo publica solo `rts-nightly.yml` (corre sobre main): mapea cada página del sitio a los specs que la visitan. Lo consume el panel de admin (Estado del sitio → Cobertura de tests por página).
- `data/cloudflare-latest.json` se actualiza solo todos los días a las 09:00 ART (`.github/workflows/update-cloudflare.yml` en este repo), y también se puede disparar a mano desde la pestaña Actions ("Run workflow").
- `data/pendientes.json` es curado a mano — se edita directamente cuando cambia el estado real.

## Secrets necesarios (Settings → Secrets → Actions, en este repo)

- `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `CF_WEB_ANALYTICS_SITE_TAG` — mismos valores que `E:\SF\tools\analytics\.env`.

## Secret necesario en el otro repo (segunda-fundacion-web)

- `STATUS_REPO_TOKEN` — token con permiso de escritura sobre este repo, para que sus workflows puedan publicar `bat-latest.json` / `rts-latest.json` acá.
