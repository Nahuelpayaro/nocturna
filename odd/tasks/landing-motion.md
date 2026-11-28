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
| T2 Animaciones de MOTION-WEB.md (piezas 1-9) | S1, S3-S7 | inline, hecho | ver git log |
| T3 Medición después, PR, vista previa, capturas | S2, S3, S6 | inline, hecho | - |

## Log

- **L1** (Nahuel, 27/11, vía PM): "Quiero que le agreguen microinteracciones y GSAP para que tenga más animaciones, que sea más dinámica. Está muy estática la web hoy en día."
- **L2** Línea de base (build de producción local, 390×844, CPU 4x más lenta, red ~1,6 Mb/s con 150 ms; mediana de 5): `/` LCP 692 ms, JS 188,5 KB, total 464,1 KB; `/diagnostico` LCP 656 ms, JS 188,5 KB, total 407,7 KB. Script: `/tmp/lm-shots/perf.mjs`. Archivo: `Transfers/nocturna-landing/motion/perf-antes-local.json`.
- **L3** Instalados `gsap` 3.15.1 y `@gsap/react` 2.1.2 (todavía sin uso en el código).
- **L4** `@gsap/react` quitado: su hook importa GSAP de forma estática y lo metería en la primera carga. GSAP y ScrollTrigger se cargan con `import()` en `components/ccp/gsap-client.ts` cuando el navegador queda libre después de la primera pintura.
- **L5** Después (mismas condiciones): `/` LCP 700 ms, JS 237,1 KB, total 516,3 KB; `/diagnostico` LCP 660 ms, JS 237,1 KB, total 456,9 KB. GSAP (27,4 KB gzip) y ScrollTrigger (17,5 KB gzip) quedan en archivos aparte que no están en el HTML inicial. Tests 63/63, build OK, eslint y tsc limpios. Verificación local (`Transfers/nocturna-landing/motion/verificacion-local.json`): 0 elementos ocultos en la primera pantalla sin JS; nada queda invisible al terminar; cifras finales correctas y repetición tras corregir; movimiento reducido sin conteo; los 4 eventos con sus nombres.
- **L6** Ajustes propios: `brand` en GSAP es `power2.out` (GSAP no acepta cubic-bezier sin CustomEase); en CSS es la curva exacta. Subrayado del paso 02 con `underline-03` (trazo plano), porque `underline-02` no se leía a ese tamaño.
