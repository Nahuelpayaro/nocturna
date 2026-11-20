# Landing CCP: Supabase, Telegram, medición y Vercel

Para Nahuel. Son pasos cortos, en orden. Al final está la lista para dar por terminada la medición.

Qué hace cada pieza:

- **Supabase** guarda los inscriptos (`ccp_waitlist`) y los eventos del embudo (`ccp_events`).
- **Telegram** te avisa a vos y a Camila cada vez que alguien se anota.
- **El conteo propio** cuenta los 4 eventos por día y por gancho (`utm_content`). Growth lo baja como CSV.
- **El píxel de Meta** solo se dispara en producción, nunca en las vistas previas ni con `?interno=1`.

Sin Supabase configurado, en tu compu y en las vistas previas todo se guarda en memoria y se pierde al reiniciar. En producción, sin Supabase, la inscripción muestra el error de envío: nunca se pierde un inscripto sin que se note.

## Variables de entorno

Van en `.env.local` (tu compu) y en Vercel. Ninguna se commitea.

| Variable | Qué es |
|---|---|
| `SUPABASE_URL` | Project URL de Supabase, tipo `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role` (o la nueva `secret`). Saltea la seguridad de la base: solo en el servidor |
| `TELEGRAM_BOT_TOKEN` | Token del bot que te da @BotFather |
| `TELEGRAM_CHAT_ID` | Id del grupo (número negativo) |
| `GROWTH_EXPORT_TOKEN` | Clave para que Growth baje el conteo diario |
| `NEXT_PUBLIC_META_PIXEL_ID` | Id del píxel de la cuenta publicitaria de nocturna. Vacío: no se carga |

`VERCEL_ENV` y `NEXT_PUBLIC_VERCEL_ENV` las pone Vercel solo. No las cargues a mano.

## 1. Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto **nuevo**, aparte del de Zukka. Nombre: `nocturna`. Región: São Paulo.
2. Andá a **SQL Editor**, pegá todo `supabase/migrations/20261114000000_ccp.sql` y tocá **Run**. Se puede volver a correr sin problema.
3. En **Table Editor** tienen que aparecer `ccp_waitlist` y `ccp_events`, las dos con el candado de RLS.
4. En **Project Settings → API**, copiá:
   - **Project URL** → `SUPABASE_URL`
   - la clave **service_role** (o la **secret**, si te muestra las nuevas) → `SUPABASE_SERVICE_ROLE_KEY`
5. Pegalas en `.env.local`. La clave `anon` / `publishable` no se usa.

## 2. Bot de Telegram

1. En Telegram, abrí **@BotFather**, mandá `/newbot` y seguí los pasos. Nombre: `nocturna avisos`.
2. Copiá el token que te da → `TELEGRAM_BOT_TOKEN`.
3. Creá un grupo con vos, Camila y el bot.
4. Mandá cualquier mensaje en el grupo, por ejemplo `hola`.
5. Abrí en el navegador `https://api.telegram.org/bot<TOKEN>/getUpdates`, con tu token en lugar de `<TOKEN>`.
6. Buscá `"chat":{"id":-100...`. Ese número, con el signo menos, va en `TELEGRAM_CHAT_ID`.
   - Si la lista sale vacía, sacá y volvé a meter al bot en el grupo, mandá otro mensaje y recargá.
7. Activá el sonido de las notificaciones del grupo en tu teléfono: el aviso tiene que sonar.

El aviso trae la hora, nombre, inmobiliaria, el WhatsApp como link `wa.me` (lo tocás y se abre el chat), las 5 respuestas, el resultado y el gancho (`utm_content`). Fuera de producción llega con `[VISTA PREVIA]`. Si lo mandaste con `?interno=1`, llega con `[INTERNO]`.

Si Telegram falla, la inscripción igual queda guardada, con `notificado = false` en la tabla.

## 3. Token para Growth

1. En la terminal: `openssl rand -hex 24`.
2. Lo que sale → `GROWTH_EXPORT_TOKEN`.
3. A Growth le pasás el link `https://<dominio>/api/ccp/conteo?token=<TOKEN>`. Devuelve un CSV con `day, utm_content, event, count`, por día de Buenos Aires y sin las visitas internas.

Sin `GROWTH_EXPORT_TOKEN`, el link da 404.

## 4. Vercel

1. En [vercel.com](https://vercel.com), **Add New → Project** e importá el repo `nocturna`. Framework: Next.js (lo detecta solo).
2. En **Settings → Environment Variables**, cargá las variables:
   - **Preview**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GROWTH_EXPORT_TOKEN`. **No** cargues `NEXT_PUBLIC_META_PIXEL_ID` en Preview.
   - **Production**: las mismas, más `NEXT_PUBLIC_META_PIXEL_ID` cuando exista la cuenta publicitaria. Se carga recién con tu OK para producción.
3. Revisá que esté activado **Automatically expose System Environment Variables** (Settings → Environment Variables). Así el código sabe si es producción o vista previa.
4. Subí una rama que no sea `main` (o tocá **Redeploy** en una vista previa). Vercel te da un link de vista previa.
5. Abrí la vista previa con `?interno=1`, hacé el diagnóstico y anotate con tu número: tiene que llegar el aviso con `[VISTA PREVIA] [INTERNO]`.

Si cambiás una variable `NEXT_PUBLIC_`, hay que volver a desplegar: se fija al compilar.

## 5. Cómo ve Camila los inscriptos

- **Telegram**: le llega el mismo aviso que a vos, en el grupo.
- **Supabase**: invitala al proyecto (**Organization → Team → Invite**) y que abra **Table Editor → `ccp_waitlist`**. Ordenada por `created_at`, ve la hora de cada inscripción para el respaldo de las 18 h.

## 6. Link de los anuncios

Ruta final: la landing está en `/` y el diagnóstico en `/diagnostico`. El link de cada anuncio:

```
https://<dominio>/?utm_source=meta&utm_medium=paid&utm_campaign=ccp-pauta-01&utm_content=g1
```

Cambiá `utm_content` por el gancho de cada anuncio: `g1`, `g2`, `g3`. Meta agrega `fbclid` solo.

Los UTM se guardan en el navegador 30 días y gana el primero. Los links internos no necesitan llevarlos.

## 7. Terminado cuando (EVENTOS-LANDING, sección 7)

- [ ] Abrís `https://<dominio>/?utm_source=meta&utm_medium=paid&utm_campaign=prueba&utm_content=g9`, completás el diagnóstico y te anotás.
- [ ] Los 4 eventos (`funnel_visit`, `diagnostic_start`, `diagnostic_complete`, `waitlist_signup`) aparecen una vez cada uno en el conteo propio con `utm_content=g9`: en `ccp_events` o en el CSV de `/api/ccp/conteo`.
- [ ] Con el id del píxel cargado (solo producción), también aparecen en **Probar eventos** del administrador de eventos de Meta.
- [ ] El registro en `ccp_waitlist` tiene `utm_content = g9`, y te llegó el aviso por Telegram (`notificado = true`).
- [ ] Recargás y volvés a pasar por las páginas: no se duplica ningún evento.
- [ ] Repetís con `?interno=1`: no aparece nada en el píxel, y en `ccp_events` y `ccp_waitlist` queda `interno = true` (el CSV no lo cuenta).

La prueba en una pestaña nueva cuenta como sesión nueva. Para repetir el paso 1 con el mismo número, borrá antes tu fila de `ccp_waitlist`: si no, sale "Ese número ya está en la lista".
