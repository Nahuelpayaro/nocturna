# Landing CCP + /diagnostico: motion with GSAP

Pedido de PM (27/11). Fuente de cada animación: `~/OpenBot/Shared/Transfers/nocturna-landing/MOTION-WEB.md` (Creatividad). Rama `feat/landing-motion`, worktree desde `origin/main` (84f1410).

## Specs

- **S1** Nahuel: "Quiero que le agreguen microinteracciones y GSAP para que tenga más animaciones, que sea más dinámica." Dependencias permitidas: `gsap` y `@gsap/react`; ninguna otra.
- **S2** "NO merge a main ni deploy a producción sin el OK de Nahuel. Vista previa de Vercel y PR sí."
- **S3** "Nada que empeore la primera carga en celular: cargá GSAP solo en cliente, sin bloquear el render; medí el peso agregado y el LCP antes/después a 390 px."
- **S4** "Respetá prefers-reduced-motion."
- **S5** "No cambies textos ni nombres de eventos (funnel_visit, diagnostic_start, diagnostic_complete, waitlist_signup) ni la API de la lista de espera."
- **S6** "Tests y build en verde; no mandes el formulario en la vista previa (guarda en la base real)."
- **S7** PM: "Mientras tanto, no inventes animaciones por tu cuenta."

## Tasks

| ID | Specs | Ruta | Commit |
|---|---|---|---|
| T1 Worktree, `gsap` + `@gsap/react`, línea de base de peso y LCP | S1, S3 | inline, hecho | (este commit) |
| T2 Animaciones de MOTION-WEB.md | S1, S3-S7 | espera MOTION-WEB.md | - |
| T3 Medición después, PR, vista previa, capturas | S2, S3, S6 | pendiente | - |

## Log

- **L1** (Nahuel, 27/11, vía PM): "Quiero que le agreguen microinteracciones y GSAP para que tenga más animaciones, que sea más dinámica. Está muy estática la web hoy en día."
- **L2** Línea de base (build de producción local, 390×844, CPU 4x más lenta, red ~1,6 Mb/s con 150 ms; mediana de 5): `/` LCP 692 ms, JS 188,5 KB, total 464,1 KB; `/diagnostico` LCP 656 ms, JS 188,5 KB, total 407,7 KB. Script: `/tmp/lm-shots/perf.mjs`. Archivo: `Transfers/nocturna-landing/motion/perf-antes-local.json`.
- **L3** Instalados `gsap` 3.15.1 y `@gsap/react` 2.1.2 (todavía sin uso en el código).
