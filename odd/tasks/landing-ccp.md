# Landing CCP + /diagnostico + lista de espera

Pedido del PM (2026-11-13, `~/Downloads/PedidoLanding.md`). Fase 1: landing, diagnóstico y formulario en código con vista previa local para que Nahuel los vea. Fase 2 (después de su OK): guardado en Supabase, aviso por Telegram, medición y vista previa en Vercel.
Fuentes: Figma `O0OOtnJGAqkT19d99IbiRE` página "Landing CCP - v1" (108:856 desktop, 108:1241 mobile); design system local `~/OpenBot/Shared/nocturna/design-system` (igual al zip de Descargas); `ventas/02-canales.md`; `Transfers/nocturna-landing/TEXTOS-LISTA-DE-ESPERA.md`; `Transfers/nocturna-medicion/EVENTOS-LANDING.md`.

## Specs

- **S1** "La landing de CCP en código, tal como está en Figma (archivo `O0OOtnJGAqkT19d99IbiRE`)." Sin los textos prohibidos: "Sin la promesa del 30 %, sin precios, sin "chatbot" ni "asistente de IA", sin afirmar pérdida ("se te enfriaron", no "perdiste")." Nahuel (14/11): "sacalos y hace el pedido y yo se lo paso a pm para que lo gestione".
- **S2** "La página `/diagnostico`, con las 5 preguntas, los controles y el resultado al instante ya decididos en `ventas/02-canales.md`". Preguntas, controles ("visitas ≤ consultas y operaciones ≤ visitas; si no se cumple, se pide revisar antes de calcular") y cálculo tal como están en 02-canales (sección "Las preguntas de `/diagnostico`" y "Cálculo"). "No se muestra un total de dinero perdido."
- **S3** "después del resultado, el dueño NO agenda una llamada: se anota en una **lista de espera**. El formulario pide nombre, inmobiliaria y WhatsApp, y guarda junto con eso sus respuestas del diagnóstico." Textos de `TEXTOS-LISTA-DE-ESPERA.md` secciones 1 a 3. Nahuel (14/11): plazo "Sin plazo" → "Nahuel te escribe por WhatsApp." sin "en menos de 24 horas".
- **S4** "/diagnostico y el formulario no están en Figma" → "armarlos con los componentes del design system y mostrárselos a Nahuel antes de seguir." Nahuel (14/11): "fijate que habiamos copiado todo el design system en un artifact y lo habiamos descargado con los chicos de openbot tambien, revisa ahi".
- **S5** "`ventas/02-canales.md` todavía dice "agenda una llamada": es del agente de la terminal; actualizarlo con la decisión del 13/11."
- **S6** Pedido de textos para el PM: lista de lo que se sacó de la landing y necesita texto de reemplazo, más el aviso de privacidad.
- **S7** Guardado y aviso: Nahuel (14/11) eligió "Supabase + Telegram (recomendado)". Aviso a Nahuel "en menos de 5 minutos" y "que Camila también pueda ver los inscriptos". Registro según EVENTOS-LANDING sección 4. Duplicado: "Ese número ya está en la lista. Nahuel te escribe por WhatsApp."
- **S8** Medición según `EVENTOS-LANDING.md` secciones 1, 2, 3, 5 y 6 (4 eventos una vez por sesión, UTM primero gana 30 días, píxel por `NEXT_PUBLIC_META_PIXEL_ID`, conteo propio por día y `utm_content`, `?interno=1`, nada personal afuera).
- **S10** Nahuel (14/11): "Si va en /" (la landing va en `/`).
- **S9** "Vista previa (no producción) con la landing, `/diagnostico` y la lista de espera andando de punta a punta, y un inscripto de prueba guardado. Deploy a producción solo con OK de Nahuel."

## Tasks

| ID | Specs | Ruta | Commit |
|---|---|---|---|
| T1 Grupos de rutas: home anterior intacta en `(estudio)`, layout CCP con tokens y fuentes del DS | S1, S4 | worker, hecho (build OK) | - |
| T2 Componentes del DS en TSX (`src/components/ccp`) | S1, S4 | worker, hecho | - |
| T3 Landing `/ccp` según Figma, sin textos prohibidos | S1 | worker, hecho (grep sin prohibidos) | - |
| T4 `/diagnostico`: preguntas, controles, resultado, invitación, formulario, confirmación (guardado provisorio) | S2, S3, S4 | worker, hecho (21 tests, e2e 44/44) | - |
| T5 Pedido de textos para el PM | S6 | inline, hecho: `ventas/pedido-textos-landing-pm.md` | - |
| T6 Actualizar `ventas/02-canales.md` | S5 | inline, hecho | - |
| T7 Vista previa local para Nahuel (puerta) | S4 | inline, hecho: OK de Nahuel (L6) | - |
| T7b Landing a `/`, web anterior a `/estudio` | S10 | inline, hecho (build OK) | - |
| T8 Supabase: tabla de inscriptos y de eventos | S7, S8 | pendiente OK | - |
| T9 Aviso por Telegram | S7 | pendiente OK | - |
| T10 Medición: eventos, UTM, interno, píxel | S8 | pendiente OK | - |
| T11 Vista previa en Vercel + inscripto de prueba | S9 | pendiente OK | - |

## Log

- **L1** (Nahuel, 14/11): "leé y hacé este pedido /Users/nahuelpayaro/Downloads/PedidoLanding.md"
- **L2** (Nahuel, 14/11, respuestas): inscriptos "Supabase + Telegram (recomendado)"; textos del 30 % "sacalos y hace el pedido y yo se lo paso a pm para que lo gestione"; plazo "Sin plazo"; diagnóstico "fijate que habiamos copiado todo el design system en un artifact y lo habiamos descargado con los chicos de openbot tambien, revisa ahi".
- **L3** Evidencia: Figma "Landing CCP - v1" tiene solo desktop y mobile de la landing. El DS local (= `~/Downloads/nocturna-design-system.zip`, mismo `bundle.js`) tiene `Diagnosis` (formulario de pedido con nombre, WhatsApp, rango de consultas) y los primitivos de formulario; no tiene las 5 preguntas, ni resultado, ni lista de espera.
- **L5** Evidencia 14/11: `pnpm build` OK; `node --test src/lib/ccp/` 21/21; eslint sobre rutas CCP OK; `pnpm lint` completo falla por error previo en `src/components/Magnetic.tsx` (sin tocar). Vista previa local en http://localhost:3000/ccp y /diagnostico.
- **L6** (Nahuel, 14/11): "1. Me parecio muy bueno 2. Perfecto ahora me pongo con eso 3. Si va en /". Landing movida a `/`; la web anterior a `/estudio` (git mv, contenido sin cambios).
- **L4** Decisión del agente: rutas `/ccp` (landing) y `/diagnostico`; la home anterior queda en `/` sin tocar hasta que Nahuel decida. Sin commits por ahora: el árbol tiene cambios sin commitear de Nahuel en los mismos archivos que se mueven.
