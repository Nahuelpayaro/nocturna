# nocturna creative studio — Brief de la Landing

> Documento de especificación para construir la landing page con Claude Code.
> Leé el documento completo antes de empezar. Al final están los criterios de aceptación.

---

## 1. Contexto del proyecto

**nocturna creative studio** es una agencia digital creativa con base en Buenos Aires, Argentina. Ofrece diseño web, branding, gestión de redes y comunicación digital a negocios locales.

Esta landing es **la pieza más importante del estudio**: es nuestra propia carta de presentación. Cuando un potencial cliente la visite, tiene que pensar *"si su propia web es así, quiero que hagan la mía"*. La landing **es** la demostración del servicio. Por eso el nivel de pulido visual, animaciones y microinteracciones debe ser alto — más alto que el de un sitio convencional.

**Objetivo de negocio:** convertir visitantes fríos (que llegan desde cold outreach por WhatsApp/email) en conversaciones de venta. La acción principal es contactar por WhatsApp o dejar los datos en un formulario.

**Tono:** elegante, oscuro, confiado, nocturno. No agresivo: poderoso y silencioso, como una pantera. Minimalista pero con vida — el movimiento es lo que lo hace especial.

---

## 2. Identidad de marca (aplicar estrictamente)

### Nombre
- Se escribe **nocturna** en minúsculas, siempre.
- Nombre completo: **nocturna creative studio**.
- **Regla absoluta:** la letra "o" de "nocturna" se reemplaza SIEMPRE por el isotipo del ojo de pantera. Nunca se escribe "nocturna" con una "o" normal en piezas diseñadas (logo, hero, footer, favicon). En texto corrido de párrafos sí puede ir como texto normal en minúsculas.

### El isotipo: el ojo de pantera
- Es un ojo almendrado **simétrico** con una **pupila vertical felina** (una elipse angosta y alta, no redonda).
- Construcción de referencia (SVG, viewBox `0 0 34 34`):
  - Ojo (forma almendrada): `<path d="M2,17 Q17,7 32,17 Q17,27 2,17 Z" />` relleno del color claro.
  - Pupila (rendija vertical): `<ellipse cx="17" cy="17" rx="2.8" ry="8" />` relleno del color de fondo.
- El ojo **parpadea**: es el activo distintivo de la marca. Animación de parpadeo = escalar el eje vertical (`scaleY`) del grupo del ojo de `1` → `0.06` → `1` en ~180-200ms, repetido cada 4.5s aprox. El origen de la transformación debe ser el centro del ojo.
- Hay versiones disponibles como SVG (ver sección 8, assets). Si no están disponibles al construir, recrealos con la especificación de arriba.

### Paleta de colores
Disciplina cromática: el sitio es **95% blanco y negro**, con un solo color de acento usado con cuentagotas.

```
--noche:    #0A0A0A   /* fondo principal, "negro noche" — NUNCA #000 puro */
--hueso:    #F5F5F3   /* el "blanco" de la marca, levemente cálido */
--gris:     #666666   /* texto secundario, subtítulos */
--gris-sutil: #1C1C1C /* bordes, divisores sobre fondo oscuro */
--ambar:    #D9A441   /* ACENTO. El color del ojo de una pantera brillando en la oscuridad.
                         Usar con muchísima moderación: CTAs, hovers, un detalle por sección. */
```

Modo oscuro por defecto (fondo `--noche`). No es necesario un modo claro alternable, pero las secciones pueden alternar entre fondo noche y fondo hueso para crear ritmo.

### Tipografía
- **Space Grotesk** — títulos, logo, todo lo que sea display. Pesos 300 (light) y 700 (bold).
- **Inter** — texto corrido de párrafos. Neutra, no compite. Pesos 400 y 500.
- **Space Mono** (opcional) — para etiquetas, números, datos técnicos, detalles tipo "(01)", "(02)". Le da un aire técnico/editorial.
- Cargar desde Google Fonts. Sentence case siempre, nunca TODO MAYÚSCULAS salvo etiquetas mono muy cortas.

### Tagline
**"Vemos lo que otros no ven."** — nace del concepto del ojo de pantera (visión nocturna, ver oportunidades donde otros no). Usable en el hero o el cierre.

---

## 3. Stack técnico

- **Next.js** (App Router) + **React** + **TypeScript**.
- **Tailwind CSS** para estilos, con los colores de marca configurados como tokens en `tailwind.config`.
- **Framer Motion** para animaciones y microinteracciones (es el motor principal de movimiento del sitio).
- Fuentes vía `next/font/google` (Space Grotesk, Inter, Space Mono).
- Sin librería de componentes pesada — componentes propios, limpios.
- Preparado para deploy en **Vercel**.
- Estructura mobile-first, totalmente responsive.

---

## 4. Estructura de secciones

El orden es: Hero → Servicios → Proceso → FAQ → Contacto (CTA final). Header fijo arriba, footer abajo.

### Header (nav)
- Logo "nocturna" (con el ojo en lugar de la "o") a la izquierda.
- Links de navegación: servicios, proceso, contacto.
- Botón CTA a la derecha: "Hablemos" (abre WhatsApp).
- Comportamiento: transparente sobre el hero, al hacer scroll se vuelve sólido con fondo `--noche` y una fina línea inferior. Transición suave.
- En mobile: menú hamburguesa con animación de apertura.

### 4.1 — Hero
- Pantalla completa (100vh), fondo `--noche`.
- Protagonista: el nombre **nocturna** en grande, con el ojo parpadeando como "o". El parpadeo debe ser lo primero que llame la atención.
- Debajo: el tagline "Vemos lo que otros no ven." o una variante ("Estudio creativo. Vemos lo que otros no ven.").
- Una línea de subtexto: qué hacemos en una frase. Ej: *"Diseño web, branding y comunicación para marcas que quieren destacar."*
- CTA primario: "Empecemos un proyecto" (WhatsApp) + CTA secundario sutil: "Ver qué hacemos" (scroll a servicios).
- **Animaciones del hero:**
  - Entrada: el nombre aparece con un fade + leve movimiento hacia arriba, escalonado letra por letra o palabra por palabra (stagger).
  - El ojo parpadea en loop cada ~4.5s.
  - Idea opcional de fondo: partículas/estrellas muy sutiles, o un gradiente radial muy tenue detrás del nombre que simule la luz tenue de la noche. Mantenerlo elegante, no recargado.
  - Indicador de scroll abajo con micro-animación (una flecha o línea que late suave).

### 4.2 — Servicios
Cinco servicios. Fondo puede alternar a `--hueso` o mantenerse noche (decidir según ritmo visual).

1. **Sitios web institucionales** — Sitios rápidos, modernos y pensados para convertir visitantes en clientes.
2. **Branding e identidad** — Logo, paleta, tipografía y sistema visual completo. Una marca que se recuerda.
3. **Redes sociales** — Gestión de contenido y presencia digital que mantiene tu marca viva todos los días.
4. **Comunicación digital** — Estrategia de mensajes, campañas y todo lo que conecta tu marca con su público.
5. **SEO y Google Maps** — Que te encuentren cuando te buscan. Posicionamiento en Google y visibilidad local.

- **Patrón visual (NO usar cards):** el grid de cards con borde iluminado es el patrón genérico de cualquier sitio hecho con IA; queda descartado. En su lugar: **"visión de pantera"** — un índice editorial donde los servicios descansan en penumbra y una luz ámbar sigue al cursor revelando lo que toca (atado al tagline "vemos lo que otros no ven"). Filas full-width separadas por hairlines, números mono "(01) → (05)", títulos grandes en Space Grotesk.
- **Animaciones:** en desktop (puntero fino) los servicios están atenuados; al hover/foco de cada fila se enciende a pleno y despliega su descripción (height + opacity), con marcador ámbar. En mobile / `prefers-reduced-motion` / sin cursor: lista completa visible a pleno contraste (el reveal es realce, nunca requisito para leer). Cada fila es focuseable por teclado y revela igual con el foco.

### 4.3 — Proceso de trabajo
Cómo trabajamos, en pasos (4 sugeridos). Esto genera confianza mostrando método.

1. **Descubrimiento** — Entendemos tu negocio, tu público y tus objetivos.
2. **Diseño** — Creamos la identidad y el diseño a medida, con tu feedback en cada paso.
3. **Desarrollo** — Construimos todo con tecnología moderna, rápida y optimizada.
4. **Lanzamiento** — Publicamos, medimos y acompañamos el crecimiento.

- **Animaciones:** timeline o línea de progreso que se "dibuja" a medida que el usuario scrollea (path drawing con Framer Motion / scroll progress). Cada paso se activa/ilumina al llegar. Números grandes en Space Grotesk.

### 4.4 — FAQ
Acordeón de preguntas frecuentes. Sugeridas (ajustables):

- ¿Cuánto tarda un proyecto web? 
- ¿Cómo son los pagos?
- ¿Trabajan con negocios de todo el país?
- ¿Qué necesitan de mí para empezar?
- ¿Ofrecen mantenimiento después del lanzamiento?

- **Animaciones:** acordeón con apertura/cierre suave (height + fade). El ícono (+ / −, o un chevron) rota con microinteracción. Solo una abierta a la vez (opcional).

### 4.5 — Contacto / CTA final
El cierre. Doble vía: WhatsApp + formulario.

- Titular fuerte: ej. *"¿Empezamos?"* o *"Hagamos algo que se vea."*
- **WhatsApp:** botón grande y claro que abre `https://wa.me/{NUMERO}?text={mensaje pre-cargado}`. (Ver placeholders sección 6.)
- **Formulario:** campos nombre, negocio/empresa, email o teléfono, mensaje. Más un select opcional de "¿qué servicio te interesa?".
  - El form por ahora puede apuntar a un placeholder de submit (ver sección 6). Dejar el handler claramente marcado para conectar luego (Formspree, un endpoint propio, o email).
  - **Microinteracciones del form:** labels flotantes animados, foco de campo con transición de borde a `--ambar`, validación inline suave, botón de submit con estado de loading y éxito animado.

### Footer
- Logo "nocturna" (con ojo).
- Links rápidos a secciones.
- Redes sociales (placeholders).
- Tagline o frase de cierre.
- Crédito sutil: "© 2026 nocturna creative studio".

---

## 5. Animaciones y microinteracciones (requisito central)

Esta es la sección más importante del brief. La landing debe sentirse **viva** sin sentirse recargada. Equilibrio entre impacto y elegancia.

**Principios:**
- Toda animación debe tener una curva de easing suave (nada lineal abrupto). Preferir `easeOut` / `easeInOut` y springs suaves de Framer Motion.
- Duraciones cortas (200–600ms en microinteracciones; entradas de sección un poco más largas).
- Respetar `prefers-reduced-motion`: si el usuario lo tiene activado, desactivar o reducir drásticamente las animaciones. **Obligatorio.**
- El movimiento guía la atención, no distrae de ella.

**Inventario mínimo de animaciones a implementar:**
- [ ] Parpadeo del ojo en el logo (loop, en header, hero y footer).
- [ ] Entrada del hero con stagger del texto.
- [ ] Header que cambia de transparente a sólido en scroll.
- [ ] Reveal de secciones al entrar en viewport (fade + slide), con stagger en grupos de cards.
- [ ] Servicios "visión de pantera": luz ámbar que sigue al cursor y revela cada servicio en penumbra (hover/foco enciende la fila y despliega su descripción).
- [ ] Timeline del proceso que se dibuja con el scroll.
- [ ] Acordeón FAQ animado.
- [ ] Microinteracciones del formulario (labels flotantes, foco, validación, submit con feedback).
- [ ] Cursor personalizado o efecto sutil de hover en elementos interactivos (opcional, si suma y no rompe mobile).
- [ ] Transiciones suaves en todos los botones y links (color, escala leve).
- [ ] Scroll suave entre secciones al clickear nav.

**Ideas opcionales de "wow" (implementar si elevan sin recargar):**
- Texto que se revela con efecto de máscara al scrollear.
- Un sutil efecto de grano/textura sobre el fondo noche para darle profundidad cinematográfica.
- Magnetic buttons (el botón sigue levemente al cursor cuando está cerca).
- El ojo del logo que "sigue" al cursor con la pupila (microinteracción muy on-brand: la pantera te mira).

---

## 6. Placeholders (datos pendientes)

Estos datos todavía no existen. **Centralizarlos en un solo archivo de configuración** (ej. `lib/config.ts` o `siteConfig`) para que se completen en un solo lugar cuando estén listos. Marcar cada uno con un comentario `// TODO: completar`.

```ts
export const siteConfig = {
  domain: "TODO",                  // ej. nocturna.studio (sin dominio todavía)
  whatsapp: "TODO",                // número con código de país, sin signos. ej. 549XXXXXXXXXX
  whatsappMessage: "Hola nocturna, vi su web y me interesa hablar sobre un proyecto.",
  email: "TODO",                   // ej. hola@nocturna.studio
  instagram: "TODO",               // ej. @nocturna.studio
  formEndpoint: "TODO",            // endpoint del formulario (Formspree / propio)
}
```

- El botón de WhatsApp y el form deben leer de este config. Mientras el número sea "TODO", el botón puede mostrar un estado deshabilitado o apuntar a "#" con un aviso en consola — pero el código debe estar listo para funcionar apenas se complete el número.
- No hardcodear ningún dato de contacto fuera de este config.

---

## 7. SEO, performance y accesibilidad

- **SEO:** metadatos completos (title, description, Open Graph, Twitter card). Title sugerido: "nocturna creative studio — Diseño web, branding y comunicación". Estructura semántica con headings correctos (un solo h1 en el hero). `lang="es"`.
- **Performance:** objetivo Lighthouse 90+ en todas las métricas. Lazy loading de lo que esté abajo del fold. Optimizar fuentes (preload, `display: swap`). Las animaciones no deben trabar el scroll (usar `transform` y `opacity`, evitar animar propiedades que disparen layout).
- **Accesibilidad:** contraste suficiente (el ámbar sobre noche debe pasar AA), navegación por teclado, focus states visibles, `alt` en imágenes, `aria-label` en botones de ícono, y el ya mencionado respeto a `prefers-reduced-motion`.
- **Favicon:** usar el isotipo del ojo (versión app icon).

---

## 8. Assets disponibles

Los logos de nocturna existen como SVG (lockup en blanco/negro, ojo suelto, app icon, avatar, versión animada). Si se proveen junto a este brief, usarlos directamente en `/public`. Si no, recrear el ojo con la especificación de la sección 2.

Estructura sugerida de assets:
```
/public
  /logos
    nocturna-lockup-blanco.svg
    nocturna-ojo-blanco.svg
    nocturna-appicon-negro.svg
    favicon (derivado del ojo)
```

---

## 9. Criterios de aceptación

La landing está terminada cuando:

1. Se ve impecable en desktop, tablet y mobile.
2. El nombre "nocturna" aparece SIEMPRE con el ojo en lugar de la "o", y el ojo parpadea.
3. Están las 5 secciones (hero, servicios, proceso, FAQ, contacto) + header + footer.
4. Todas las animaciones del inventario mínimo (sección 5) funcionan y son suaves.
5. Se respeta `prefers-reduced-motion`.
6. La paleta es fiel: noche + hueso + gris, con ámbar usado con moderación.
7. Tipografías correctas (Space Grotesk display, Inter texto).
8. Todos los datos de contacto vienen de `siteConfig` y están marcados como TODO.
9. El WhatsApp y el formulario están cableados y listos para activarse al completar los datos.
10. Lighthouse 90+ en performance, accesibilidad, mejores prácticas y SEO.
11. El código está limpio, comentado donde importa, y es fácil de mantener.

---

## 10. Cómo arrancar (sugerencia para Claude Code)

1. Inicializar proyecto Next.js + TypeScript + Tailwind.
2. Configurar tokens de color y fuentes.
3. Crear `siteConfig` con los placeholders.
4. Construir el componente del logo (con ojo + parpadeo) primero — es el corazón de la identidad.
5. Maquetar sección por sección, de arriba hacia abajo, sumando animaciones a medida.
6. Pasada final de microinteracciones, responsive y performance.
7. Verificar criterios de aceptación.
