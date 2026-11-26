import type { CSSProperties, ReactNode } from "react";
import { CTA_DIAGNOSTICO, cx, DIAGNOSTICO_HREF, INSTAGRAM_URL, NAV_LINKS, pad2 } from "@/lib/ccp/assets";
import { CcpLockup, InstagramGlyph, Wordmark } from "./brand";
import { Button, Tag } from "./buttons";
import { Callout, FactItem, FeatureItem, GuaranteeCard, ProblemCard, SectionHeader, StepCard } from "./cards";
import { DeliverableItem, FaqItem } from "./disclosure";
import { Agent, AgentReference, Hand, Headline, Highlight, Path } from "./graphics";
import { NavBar } from "./nav";
import { StickyCta } from "./sticky-cta";

/* Bloques de Cero Consultas Perdidas (bundle.js del DS). Cada bloque es un solo marcado
   responsive: lo que cambia entre Desktop y Mobile se renderiza dos veces con
   .nc-only-desktop / .nc-only-mobile. */

export function Section({ id, theme, className, style, children }: { id?: string; theme?: "ink"; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <section id={id} className={cx("nc-section", className)} data-theme={theme} style={style}>
      {children}
    </section>
  );
}

export function Hero() {
  return (
    <Section className="nc-hero">
      <div className="nc-hero__intro">
        <Tag tone="accent">Para dueños de inmobiliarias</Tag>
        <h1 className="nc-headline nc-t-display-poster nc-hero__title">
          <span className="nc-headline__line">
            <Highlight>cero</Highlight>
          </span>
          <span className="nc-headline__plain">{"consultas\nperdidas."}</span>
        </h1>
        <Agent width={420} className="nc-hero__agent nc-only-desktop" />
      </div>
      <div className="nc-hero__text">
        <p className="nc-t-lead">
          {/* PROVISORIO: pedido de textos al PM */}
          Ayudamos a inmobiliarias a responder cada consulta en minutos y seguirla hasta la visita, sin que el dueño tenga que estar encima.
        </p>
        <div className="nc-actions">
          <Button variant="primary" blockMobile href={DIAGNOSTICO_HREF}>
            {CTA_DIAGNOSTICO}
          </Button>
        </div>
        {/* "El piloto es pago" sale de debajo del botón: queda en Piloto y en Preguntas (auditoría mobile, L2). */}
        <div className="nc-hero__facts">
          <FactItem label="Primera respuesta" value="Menos de 5 minutos" />
          <FactItem label="Horario" value="A toda hora" />
          <FactItem label="Lo opera" value="nocturna" />
        </div>
        <Agent width={140} className="nc-hero__agent nc-only-mobile" />
      </div>
    </Section>
  );
}

const PROBLEMS: Array<[string, string]> = [
  ["Se responden tarde", "Llegan por WhatsApp, Instagram o los portales y el que contesta es el dueño, cuando puede."],
  ["Nadie las sigue", "Se responde una vez y nadie vuelve a escribir. La consulta se enfría antes de llegar a la visita."],
  ["Todo pasa por el dueño", "O por un equipo que responde cuando puede, o por un sistema que registra las consultas pero no las responde ni las sigue."],
];

export function Problem() {
  return (
    <Section className="nc-block nc-problem-block">
      <AgentReference pose="keyhole" height={170} className="nc-block__agent nc-only-desktop" style={{ transform: "rotate(1deg)" }} />
      <SectionHeader
        layout="split"
        title="las consultas"
        highlight="no esperan."
        mobile={{ highlight: "no", highlight2: "esperan.", showHighlight2: true }}
        body="Llegan por WhatsApp, Instagram o los portales, se responden tarde o nadie las sigue."
      />
      <AgentReference pose="keyhole" height={120} className="nc-block__agent nc-only-mobile" style={{ transform: "rotate(1deg)" }} />
      <div className="nc-grid nc-grid--3">
        {PROBLEMS.map(([title, text]) => (
          <ProblemCard key={title} title={title} text={text} showScribble={false} />
        ))}
      </div>
    </Section>
  );
}

const STEPS: Array<[string, string, string]> = [
  ["01", "Consulta", "Llega por WhatsApp, Instagram o los portales. Entra a una sola bandeja."],
  ["02", "Respuesta", "Respondemos en menos de 5 minutos, a toda hora, y calificamos al interesado."],
  ["03", "Seguimiento", "Si no contesta, lo seguimos. La conversación no se enfría."],
  ["04", "Visita", "Tu equipo entra cuando el interesado está listo para visitar."],
];

export function HowItWorks() {
  return (
    <Section id="como-funciona" className="nc-block">
      <SectionHeader
        layout="centered"
        title="de la consulta a la visita,"
        highlight="sin que estés encima."
        mobile={{ highlight: "sin que estés", highlight2: "encima.", showHighlight2: true }}
        body="Respondemos cada consulta en menos de 5 minutos, a toda hora, y la seguimos hasta que la persona agenda la visita. Lo operamos nosotros: vos no configurás nada."
      />
      <div className="nc-how__path nc-only-desktop">
        <Path width={734} showLabels={false} />
        <AgentReference pose="trench-coat" height={200} style={{ transform: "rotate(2deg)" }} />
      </div>
      <div className="nc-agent-row nc-only-mobile">
        <AgentReference pose="trench-coat" height={120} />
      </div>
      <div className="nc-grid nc-grid--4">
        {STEPS.map(([n, title, text]) => (
          <StepCard key={n} number={n} title={title} text={text} />
        ))}
      </div>
    </Section>
  );
}

export function CtaBand({ ink = false, title = "el programa piloto es para", highlight = "dos inmobiliarias.", showHand = true }: { ink?: boolean; title?: ReactNode; highlight?: ReactNode; showHand?: boolean }) {
  return (
    <section className={cx("nc-band", ink && "nc-paper")} data-theme={ink ? "ink" : undefined}>
      <Headline size="display-l" title={title} highlight={highlight} />
      <div className="nc-band__actions">
        {showHand ? <Hand gesture="pointing" height={109} className="nc-only-desktop" /> : null}
        <Button variant="primary" blockMobile href={DIAGNOSTICO_HREF}>
          {CTA_DIAGNOSTICO}
        </Button>
      </div>
    </section>
  );
}

const CONDITIONS =
  "“Hiciste tu parte” quiere decir cuatro cosas que registra el sistema: no revocar el acceso a tus canales, tomar cada conversación cuando el interesado está listo, mantener la cartera al día y pasar por la bandeja toda consulta que te llegue por otro lado.";

export function Guarantees() {
  return (
    <Section id="garantias" className="nc-block nc-guarantees">
      <AgentReference pose="newspaper" height={150} className="nc-block__agent nc-only-desktop" style={{ transform: "rotate(2deg)" }} />
      <SectionHeader
        layout="split"
        title="el riesgo lo"
        highlight="cubre nocturna."
        mobile={{ highlight: "cubre", highlight2: "nocturna.", showHighlight2: true }}
        body="Dos garantías por contrato: una desde el primer mes y otra a los 90 días."
      />
      <AgentReference pose="newspaper" height={120} className="nc-block__agent nc-only-mobile" style={{ transform: "rotate(2deg)" }} />
      <div className="nc-grid nc-grid--2">
        <GuaranteeCard title="Respuesta en menos de 5 minutos" text="Cada consulta que tardemos más de 5 minutos en responder te la descontamos de la factura." />
        <GuaranteeCard
          title="Seguimos sin cobrarte hasta llegar"
          // PROVISORIO: pedido de textos al PM
          text="Si no llegamos al objetivo y hiciste tu parte, seguimos sin cobrarte hasta llegar, hasta tres meses más."
        >
          <p className="nc-t-body-m nc-muted nc-only-desktop">{CONDITIONS}</p>
        </GuaranteeCard>
      </div>
      <p className="nc-t-body-m nc-muted nc-only-mobile">{CONDITIONS}</p>
    </Section>
  );
}

export const OFFER_ITEMS = [
  "Respondemos cada consulta en menos de 5 minutos, a toda hora.",
  "La seguimos hasta que la persona agenda la visita.",
  "Lo operamos nosotros: vos no configurás nada.",
  "Tu equipo entra cuando el interesado está listo para visitar.",
  // PROVISORIO: pedido de textos al PM
  "Si no llegamos al objetivo y hiciste tu parte, seguimos sin cobrarte.",
];

export function PilotBanner() {
  return (
    <Section id="programa-piloto" theme="ink" className="nc-block nc-paper nc-pilot">
      <div className="nc-pilot__cols">
        <div className="nc-stack nc-gap-24">
          <Tag tone="accent">2 lugares</Tag>
          <h2 className="nc-t-display-l">Programa Piloto</h2>
          {/* PROVISORIO: pedido de textos al PM */}
          <p className="nc-t-body-l nc-muted">El piloto es pago, a cambio de documentar el caso con tus números.</p>
          <div className="nc-stack nc-gap-12">
            <Button variant="accent" blockMobile href={DIAGNOSTICO_HREF}>
              Quiero uno de los dos lugares
            </Button>
            <p className="nc-t-body-m nc-muted">Primero, el diagnóstico: cinco preguntas.</p>
          </div>
        </div>
        <div className="nc-stack nc-gap-32">
          <div className="nc-stack nc-gap-12">
            {OFFER_ITEMS.map((t) => (
              <FeatureItem key={t}>{t}</FeatureItem>
            ))}
          </div>
          <Callout
            tone="subtle"
            // PROVISORIO: pedido de textos al PM
            kicker="A cambio del piloto"
            title="Documentamos el caso con tus números."
            body="Vos elegís si aparece tu nombre. El testimonio, a los 90 días y solo si llegamos al resultado. Y nos presentás a dos colegas."
          />
        </div>
      </div>
    </Section>
  );
}

const DELIVERABLES: Array<[string, string]> = [
  ["Respuesta y calificación 24/7", "Respondemos cada consulta en menos de 5 minutos, a toda hora, resolvemos las preguntas frecuentes y calificamos al interesado sin interrogarlo. Cuando está listo para visitar, pasa a tu equipo."],
  ["Ficha de propiedad en un clic", "La ficha de cada propiedad sale completa y actualizada en segundos, con fotos, precio y disponibilidad confirmados antes de enviarla."],
  ["Visita coordinada en minutos", "Coordinamos el horario entre el interesado, el propietario y tu agente en una sola conversación, confirmamos el día antes y reasignamos si alguien se baja."],
  ["Bandeja sin consultas perdidas", "WhatsApp, Instagram, los portales y las llamadas al cartel entran a una sola bandeja, ordenada y separada de tu vida personal."],
  ["La misma calidad, sin que estés encima", "Criterios, guiones y reglas de reparto por escrito: cualquier agente atiende igual, sin prometer lo que no se puede cumplir y sin que tengas que revisar cada conversación."],
  ["Arranque sin contraseñas", "Nos das acceso como usuario del sistema, sin compartir contraseñas. Lo podés revocar cuando quieras y recuperar el control con un clic."],
  ["El riesgo lo cubre nocturna", "Trazabilidad de cada operación, garantía por escrito, reporte mensual y un plan de salida completo si algún día dejás el servicio."],
  ["El número sale de tu negocio", "Antes de empezar auditamos tu negocio en vivo: el precio sale de tus números reales, con el piso por escrito, no de un monto genérico."],
  ["Seguimiento que no se enfría", "Si alguien no contesta, lo volvemos a contactar con una cadencia fija, y el resultado de cada visita queda registrado sin depender de la memoria de nadie."],
  // PROVISORIO: pedido de textos al PM
  ["Tablero que prueba el resultado", "Un tablero con tus propios números: cuántas consultas entran, cuántas se pierden y cuántas llegan a visita y a operación."],
];

export function PilotIncludes() {
  return (
    <Section className="nc-block">
      <div className="nc-split nc-split--center">
        <div className="nc-split__left">
          <SectionHeader
            title="qué"
            highlight="incluye."
            body="El sistema responde y califica a toda hora, nocturna supervisa y ajusta, y tu equipo toma la conversación cuando el interesado está listo para visitar."
          />
        </div>
        <div className="nc-split__right">
          {DELIVERABLES.map(([title, text], i) => (
            <DeliverableItem key={title} number={pad2(i + 1)} title={title} text={text} defaultOpen={false} />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Diagnosis() {
  return (
    <Section className="nc-block">
      <div className="nc-split">
        <div className="nc-split__left nc-stack nc-gap-48">
          <SectionHeader
            title="pedí tu diagnóstico"
            highlight="gratuito."
            // PROVISORIO: pedido de textos al PM
            body="Cinco preguntas sobre tu inmobiliaria y ves el resultado al instante. Más o menos está bien."
          />
          <div>
            {/* PROVISORIO: pedido de textos al PM */}
            <Button variant="accent" blockMobile href={DIAGNOSTICO_HREF}>
              {CTA_DIAGNOSTICO}
            </Button>
          </div>
        </div>
        <div className="nc-split__right nc-diag__hand nc-only-desktop">
          <Hand gesture="holding-phone" height={170} />
        </div>
      </div>
    </Section>
  );
}

const FAQS: Array<[string, string | undefined]> = [
  ["¿Tengo que cambiar el sistema que uso hoy?", undefined],
  // PROVISORIO: pedido de textos al PM
  ["¿El Programa Piloto tiene costo?", "Sí. Es pago, a cambio de documentar el caso con tus números."],
  ["¿Qué tiene que hacer mi equipo?", "Tomar la conversación cuando el interesado está listo para visitar."],
];

export function Faq() {
  return (
    <Section id="preguntas" className="nc-block">
      <div className="nc-split">
        <div className="nc-split__left">
          <SectionHeader title="preguntas frecuentes." showHighlight={false} />
        </div>
        <div className="nc-split__right">
          {FAQS.map(([q, a]) => (
            <FaqItem key={q} question={q} answer={a} defaultOpen={false} />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Footer({ showCta = true, links = NAV_LINKS, compact = false }: { showCta?: boolean; links?: Array<[string, string]>; compact?: boolean }) {
  // Privacidad y Términos no van hasta que existan sus páginas: eran links a "#" (auditoría mobile, L9).
  // compact: solo marca, copyright e Instagram, sin links a la landing (/diagnostico, auditoría mobile, D5).
  const cols: Array<[string, Array<[string, string]>]> = compact
    ? []
    : [
        ["Página", links],
        // Contacto: nocturna no tiene número de WhatsApp público, queda solo Instagram.
        ["Contacto", [["Instagram", INSTAGRAM_URL]]],
      ];
  return (
    <footer className={cx("nc-footer nc-paper", compact && "nc-footer--compact")} data-theme="ink">
      {showCta ? (
        <div className="nc-footer__cta">
          <Headline
            size="display-xl"
            title="¿cuánto tarda tu inmobiliaria"
            // Textos de Contenido (TEXTOS-PERDIDA.md, 26/11), aprobados por Nahuel.
            highlight="en contestar una consulta?"
            mobile={{ highlight: "en contestar", highlight2: "una consulta?", showHighlight2: true }}
          />
          {/* PROVISORIO: pedido de textos al PM */}
          <p className="nc-t-body-l nc-muted">Hacé el diagnóstico: con tus números ves cuántas consultas respondés después de 5 minutos y cuánto vale cada una.</p>
          <div className="nc-actions">
            <Button variant="accent" blockMobile href={DIAGNOSTICO_HREF}>
              {CTA_DIAGNOSTICO}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="nc-footer__main">
        <div className="nc-footer__brand">
          <CcpLockup />
          <Wordmark height={24} />
        </div>
        {cols.length ? (
        <div className="nc-footer__cols">
          {cols.map(([heading, links]) => (
            <div key={heading} className="nc-footer__col">
              <span className="nc-t-overline nc-muted">{heading}</span>
              {links.map(([label, href]) => (
                <a key={label} href={href} className="nc-t-body-m" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
        ) : null}
      </div>
      <div className="nc-footer__copy">
        <span className="nc-t-body-m nc-subtle">© 2026 nocturna - Buenos Aires</span>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram de nocturna">
          <InstagramGlyph color="white" size={32} />
        </a>
      </div>
    </footer>
  );
}

export function LandingCcp() {
  return (
    <div className="nc-landing nc-landing--sticky nc-paper">
      <NavBar />
      <main>
        {/* Orden de la auditoría mobile (L3): la banda del diagnóstico sube y reemplaza a la banda negra repetida. */}
        <Hero />
        <Problem />
        <HowItWorks />
        <Diagnosis />
        <Guarantees />
        <PilotBanner />
        <PilotIncludes />
        <Faq />
      </main>
      <Footer />
      <StickyCta />
    </div>
  );
}
