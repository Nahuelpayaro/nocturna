# Landing CCP + /diagnostico en mobile

Pedido de PM (26/11) para implementar la auditoría mobile de Creatividad.
Fuente de cada cambio: `~/OpenBot/Shared/Transfers/nocturna-landing/AUDITORIA-MOBILE.md` (secciones D1-D6, L1-L9). Rama `feat/landing-mobile`, worktree desde `origin/main`.

## Specs

- **S1** Implementar la auditoría: "Fuente: ~/OpenBot/Shared/Transfers/nocturna-landing/AUDITORIA-MOBILE.md". Prioridad: "priorizá el diagnóstico como página de entrada en mobile. Tiene que quedar claro qué es y por qué conviene hacerlo, sin depender de haber pasado por la landing. Después la landing."
- **S2** "no cambiar textos salvo lo que pida la auditoría y respetando las reglas de copy (sin precios, sin '30 %', sin 'chatbot' ni 'asistente de IA', sin afirmar pérdida)".
- **S3** "no romper los eventos de medición ni el guardado de la lista de espera (no cambies nombres de eventos ni la API)". PM: "que "Ver mi resultado" y el botón nuevo "Quiero uno de los dos lugares" sigan disparando los eventos actuales con los mismos nombres."
- **S4** "tests existentes en verde y build OK".
- **S5** Decisiones de PM (26/11): "usá `text-wrap: balance` en los titulares y dejá sin tocar el checkbox y los tres textos hasta que se decidan." (Los tres textos: "muchas inmobiliarias pierden consultas.", el "recuperes" del resultado y "¿cuántas consultas se te enfriaron este mes?".)
- **S6** "Vista previa en Vercel sí; NO merge a main, NO deploy a producción, NO push a main. Abrí PR contra main". PM: "fijate si la vista previa de Vercel guarda en la base de producción y avisa al Telegram. Si guarda ahí, no lo envíes." (Las variables de Supabase y Telegram están en Production y Preview: el formulario NO se envía en la vista previa.)
- **S7** Capturas antes/después en 390 px en `~/OpenBot/Shared/Transfers/nocturna-landing/`.

## Tasks

| ID | Specs | Ruta | Commit |
|---|---|---|---|
| T1 Capturas "antes" en 390 px (producción, `?interno=1`) | S7 | inline | - |
| T2 /diagnostico: D1-D6 de la auditoría | S1-S5 | worker | - |
| T3 Landing: L1-L9 de la auditoría | S1-S5 | worker | - |
| T4 Push de la rama, PR contra main, vista previa, capturas "después" | S6, S7 | inline | - |

## Log

- **L1** (Nahuel, vía PM): "revisen bien la landing en mobile, esta confusa, que sea bien responsive y este todo bien ordenado, analicenla en cuanto a ux/ui como si fuesen un diseñador senior de 5 años de xp enfocado en la venta, acomoden todo eso tambien, incluido el diagnostico"
- **L2** PM (26/11): OK Opus 5.5 high; worktree desde `origin/main`; `text-wrap: balance`; checkbox y tres textos sin tocar; verificar eventos en la vista previa; no enviar el formulario si la vista previa guarda en producción.
- **L3** Evidencia: `vercel env ls` muestra SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en "Production, Preview" → la vista previa guarda en la base de producción y avisa por Telegram.
