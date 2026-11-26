"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Field, FeatureItem, FormStatus, Headline, Input, RadioCardGroup, Section, SectionHeader, StatCard, Tag, fieldHelperId, fieldLabelId } from "@/components/ccp";
import { cx } from "@/lib/ccp/assets";
import {
  calcularDiagnostico,
  formatMonto,
  formatWhatsapp,
  MAX_TEXTO,
  MAX_MAIL,
  validarDiagnostico,
  validarInscripcion,
  type CampoDiagnostico,
  type CampoInscripcion,
  type DiagnosticoInput,
  type Respuestas,
  type Resultado,
} from "@/lib/ccp/diagnostico";
import { atribucionParaFormulario, track } from "@/lib/ccp/track";
import { joinWaitlist } from "./actions";

/* /diagnostico: preguntas → resultado al instante → invitación a la lista de espera → formulario → confirmación.
   Preguntas y cálculo: ventas/02-canales.md. Textos de la lista de espera: TEXTOS-LISTA-DE-ESPERA.md, secciones 1 a 3,
   sin plazo (Nahuel, 14/11). */

// Pesos ya elegido: el público es Argentina (auditoría mobile, D2).
const VACIO: DiagnosticoInput = { consultas: "", periodo: "mes", visitas: "", operaciones: "", comision: "", moneda: "ARS", respondeATiempo: "" };

/** Orden de la página, para llevar el foco al primer campo con error. */
const FOCO_DIAGNOSTICO: Array<[CampoDiagnostico, string]> = [
  ["respondeATiempo", "d-responde"],
  ["consultas", "d-consultas"],
  ["visitas", "d-visitas"],
  ["operaciones", "d-operaciones"],
  ["comision", "d-comision"],
  ["moneda", "d-moneda"],
];
const FOCO_INSCRIPCION: Array<[CampoInscripcion, string]> = [
  ["nombre", "w-nombre"],
  ["inmobiliaria", "w-inmobiliaria"],
  ["whatsapp", "w-whatsapp"],
  ["mail", "w-mail"],
];

const ESCALA = Array.from({ length: 11 }, (_, i) => ({ value: String(i), title: String(i) }));
const MONEDAS = [
  { value: "ARS", title: "Pesos" },
  { value: "USD", title: "Dólares" },
];

// Grupos de radios: el foco va al primero.
const RADIOS: Record<string, string> = { "d-responde": "respondeATiempo", "d-moneda": "moneda" };

function enfocar(id: string) {
  const el = RADIOS[id] ? document.querySelector<HTMLElement>(`input[name="${RADIOS[id]}"]`) : document.getElementById(id);
  if (id === "resultado-titulo" && el) {
    // Sin esto el navegador baja lo mínimo y las cifras quedan fuera de pantalla (auditoría mobile, D3).
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  el?.focus();
}

type Estado = "idle" | "sending" | "duplicate" | "error";

export function DiagnosticoFlow() {
  const [respuestas, setRespuestas] = useState<DiagnosticoInput>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<CampoDiagnostico, string>>>({});
  const [control, setControl] = useState<{ mensaje: string; campos: CampoDiagnostico[] } | null>(null);
  const [resultado, setResultado] = useState<{ respuestas: Respuestas; resultado: Resultado } | null>(null);

  // Sin casilla: anotarse con el aviso debajo del botón es aceptar que te escriban (Nahuel, 26/11). La API sigue pidiendo acepta: true.
  const [datos, setDatos] = useState({ nombre: "", inmobiliaria: "", whatsapp: "", mail: "", acepta: true });
  const [erroresForm, setErroresForm] = useState<Partial<Record<CampoInscripcion, string>>>({});
  const [estado, setEstado] = useState<Estado>("idle");
  // Última inscripción guardada; si el dueño corrige el número, la próxima la reemplaza.
  const [inscripto, setInscripto] = useState<{ id: string; nombre: string; whatsapp: string } | null>(null);
  const [confirmacion, setConfirmacion] = useState(false);
  const [foco, setFoco] = useState<{ id: string; n: number } | null>(null);

  const empezo = useRef(false);
  const completo = useRef(false);
  const enviando = useRef(false);

  // Mueve el foco a lo que acaba de aparecer (resultado, confirmación o el formulario al corregir).
  useEffect(() => {
    if (foco) enfocar(foco.id);
  }, [foco]);
  const pedirFoco = (id: string) => setFoco((f) => ({ id, n: (f?.n ?? 0) + 1 }));

  const cambiar = (campo: keyof DiagnosticoInput, valor: string) => {
    if (!empezo.current && campo !== "periodo") {
      empezo.current = true;
      track("diagnostic_start");
    }
    setRespuestas((r) => ({ ...r, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo === "periodo" ? "consultas" : campo]: undefined }));
    setControl(null);
    // Si cambian los números, el resultado anterior ya no vale: se vuelve a calcular.
    setResultado(null);
  };

  const calcular = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validarDiagnostico(respuestas);
    if (!v.ok) {
      setErrores(v.errores);
      setControl(v.control ? { mensaje: v.control, campos: v.camposControl } : null);
      const primero = FOCO_DIAGNOSTICO.find(([c]) => v.errores[c] || v.camposControl.includes(c));
      if (primero) enfocar(primero[1]);
      return;
    }
    setErrores({});
    setControl(null);
    setResultado({ respuestas: v.respuestas, resultado: calcularDiagnostico(v.respuestas) });
    if (!completo.current) {
      completo.current = true;
      track("diagnostic_complete");
    }
    pedirFoco("resultado-titulo");
  };

  const anotarme = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando.current) return;
    const v = validarInscripcion(datos);
    if (!v.ok) {
      setErroresForm(v.errores);
      const primero = FOCO_INSCRIPCION.find(([c]) => v.errores[c]);
      if (primero) enfocar(primero[1]);
      return;
    }
    setErroresForm({});
    setEstado("sending");
    enviando.current = true;
    const corrige = inscripto?.id ?? null;
    let res: Awaited<ReturnType<typeof joinWaitlist>>;
    try {
      res = await joinWaitlist({
        ...datos,
        respuestas,
        ...atribucionParaFormulario(),
        corrige,
      });
    } catch {
      res = { ok: false, reason: "error" };
    }
    enviando.current = false;
    if (res.ok) {
      // Una corrección del número no es una inscripción nueva.
      if (!corrige) track("waitlist_signup", { event_id: res.id });
      setEstado("idle");
      setInscripto({ id: res.id, nombre: v.datos.nombre, whatsapp: v.datos.whatsapp });
      setConfirmacion(true);
      window.scrollTo({ top: 0 });
      pedirFoco("confirmacion-titulo");
      return;
    }
    if (res.reason === "invalid" && res.fieldErrors) {
      const f = res.fieldErrors;
      setErroresForm({ nombre: f.nombre, inmobiliaria: f.inmobiliaria, whatsapp: f.whatsapp, mail: f.mail });
    }
    setEstado(res.reason === "duplicate" ? "duplicate" : "error");
  };

  const corregir = () => {
    // Vuelve al formulario con los datos cargados; la próxima inscripción reemplaza a esta.
    setConfirmacion(false);
    pedirFoco("w-whatsapp");
  };

  const dato = (campo: "nombre" | "inmobiliaria" | "whatsapp" | "mail", valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErroresForm((e) => ({ ...e, [campo]: undefined }));
    if (estado !== "sending") setEstado("idle");
  };

  if (confirmacion && inscripto) {
    return (
      <main>
        <Section className="nc-block">
          <SectionHeader
            as="h1"
            headingId="confirmacion-titulo"
            headingTabIndex={-1}
            title="ya estás en la"
            highlight="lista de espera."
            body={`Listo, ${inscripto.nombre}. Nahuel te escribe por WhatsApp al ${formatWhatsapp(inscripto.whatsapp)}.`}
          />
          <div className="nc-stack nc-gap-16">
            {/* PROVISORIO: "Qué sigue" como rótulo visible (en TEXTOS es el nombre de la fila). */}
            <h2 className="nc-t-overline nc-muted">Qué sigue</h2>
            {/* Las líneas 2 y 3 dependen de lo que Nahuel decida ofrecer (TEXTOS, sección 3). */}
            <FeatureItem>Te escribe Nahuel, en persona.</FeatureItem>
          </div>
          <button type="button" className="nc-link nc-link--m nc-link--button" onClick={corregir}>
            ¿Pusiste mal el número? Corregilo.
          </button>
        </Section>
      </main>
    );
  }

  const r = resultado;
  const moneda = r?.respuestas.moneda ?? "USD";
  const porSemana = respuestas.periodo === "semana";
  const invalido = (c: CampoDiagnostico) => Boolean(errores[c] || control?.campos.includes(c));
  const describe = (id: string, c: CampoDiagnostico, helper = false) =>
    cx(errores[c] || helper ? fieldHelperId(id) : undefined, control?.campos.includes(c) && "d-control") || undefined;
  const errorComision = errores.comision || errores.moneda;

  return (
    <main>
      <Section className="nc-block nc-diag__intro">
        <div className="nc-split nc-split--diag">
          <div className="nc-split__left nc-stack nc-gap-24">
            <Tag tone="accent">Para dueños de inmobiliarias</Tag>
            <SectionHeader
              as="h1"
              title="tu diagnóstico"
              highlight="gratuito."
              // Auditoría mobile (D1): qué te llevás. Copy a validar por Contenido.
              body="Cinco preguntas sobre tu inmobiliaria. Al instante ves cuánto vale cada consulta y cuántas se responden después de los 5 minutos. Más o menos está bien."
            />
            <div className="nc-stack nc-gap-12 nc-diag__promise">
              <FeatureItem>Ves el resultado sin dejar tus datos.</FeatureItem>
              <FeatureItem>Lo hace nocturna: respondemos las consultas de tu inmobiliaria en menos de 5 minutos, a toda hora.</FeatureItem>
            </div>
          </div>
          <form className="nc-split__right nc-form nc-diag__form" noValidate onSubmit={calcular}>
            {/* Primero la pregunta del anuncio g2 (auditoría mobile, D2). */}
            <Field id="d-responde" group className="nc-field--wide" label="1. De cada 10 consultas, ¿cuántas respondés en menos de 5 minutos?" error={errores.respondeATiempo}>
              <RadioCardGroup
                name="respondeATiempo"
                className="nc-scale"
                value={respuestas.respondeATiempo}
                onChange={(v) => cambiar("respondeATiempo", v)}
                options={ESCALA}
                aria-labelledby={fieldLabelId("d-responde")}
                aria-describedby={errores.respondeATiempo ? fieldHelperId("d-responde") : undefined}
                invalid={invalido("respondeATiempo")}
              />
            </Field>
            <Field
              id="d-consultas"
              label={porSemana ? "2. ¿Cuántas consultas te llegan por semana?" : "2. ¿Cuántas consultas te llegan por mes?"}
              helper="Sumando WhatsApp, Instagram, portales y llamadas."
              error={errores.consultas}
            >
              <Input id="d-consultas" inputMode="numeric" autoComplete="off" value={respuestas.consultas} onChange={(e) => cambiar("consultas", e.target.value)} invalid={invalido("consultas")} aria-describedby={describe("d-consultas", "consultas", true)} />
              <RadioCardGroup
                name="periodo"
                className="nc-seg"
                value={respuestas.periodo}
                onChange={(v) => cambiar("periodo", v)}
                aria-labelledby={fieldLabelId("d-consultas")}
                options={[
                  { value: "mes", title: "Por mes" },
                  { value: "semana", title: "Por semana" },
                ]}
              />
            </Field>
            <Field id="d-visitas" label="3. ¿Cuántas visitas hacen por mes?" error={errores.visitas}>
              <Input id="d-visitas" inputMode="numeric" autoComplete="off" value={respuestas.visitas} onChange={(e) => cambiar("visitas", e.target.value)} invalid={invalido("visitas")} aria-describedby={describe("d-visitas", "visitas")} />
            </Field>
            <Field id="d-operaciones" label="4. ¿Cuántas operaciones cierran por mes?" helper="Ventas y alquileres." error={errores.operaciones}>
              <Input id="d-operaciones" inputMode="numeric" autoComplete="off" value={respuestas.operaciones} onChange={(e) => cambiar("operaciones", e.target.value)} invalid={invalido("operaciones")} aria-describedby={describe("d-operaciones", "operaciones", true)} />
            </Field>
            <Field id="d-comision" label="5. ¿Cuánto te queda en promedio por operación?" error={errorComision}>
              <Input id="d-comision" inputMode="numeric" autoComplete="off" value={respuestas.comision} onChange={(e) => cambiar("comision", e.target.value)} invalid={invalido("comision")} aria-describedby={errores.comision ? fieldHelperId("d-comision") : undefined} />
              {/* Moneda: mismo control que "Por mes / Por semana", con Pesos ya elegido (auditoría mobile, D2). */}
              <span id="d-moneda-label" className="nc-sr-only">
                Moneda
              </span>
              <RadioCardGroup
                name="moneda"
                className="nc-seg"
                value={respuestas.moneda}
                onChange={(v) => cambiar("moneda", v)}
                options={MONEDAS}
                aria-labelledby="d-moneda-label"
                aria-describedby={errores.moneda ? fieldHelperId("d-comision") : undefined}
                invalid={invalido("moneda")}
              />
            </Field>
            {control ? (
              <div id="d-control">
                <FormStatus tone="error">{control.mensaje}</FormStatus>
              </div>
            ) : null}
            {/* PROVISORIO: texto del botón. */}
            <Button type="submit" variant="primary" blockMobile>
              Ver mi resultado
            </Button>
          </form>
        </div>
      </Section>

      {r ? (
        <>
          <Section className="nc-block nc-diag__result">
            <div className="nc-split nc-split--diag">
              <div className="nc-split__left">
                {/* PROVISORIO: titular del resultado. */}
                <SectionHeader headingId="resultado-titulo" headingTabIndex={-1} title="tu" highlight="resultado." />
              </div>
              <div className="nc-split__right nc-diag__stats" aria-live="polite">
                {/* PROVISORIO: textos del resultado (pedido al PM). Nunca un total de dinero perdido (02-canales). */}
                <StatCard value={formatMonto(r.resultado.valorConsulta, moneda)} label={`Cada consulta vale ${formatMonto(r.resultado.valorConsulta, moneda)} para tu inmobiliaria.`} />
                {Math.round(r.resultado.expuestas) > 0 ? (
                  <>
                    <StatCard
                      value={Math.round(r.resultado.expuestas)}
                      label={`De ${r.respuestas.consultasMes} consultas por mes, unas ${Math.round(r.resultado.expuestas)} se responden después de 5 minutos.`}
                    />
                    <StatCard tone="accent" value={formatMonto(r.resultado.escala, moneda)} label={`Cada 10 % de esas consultas que pases a responder en menos de 5 minutos vale ${formatMonto(r.resultado.escala, moneda)} por mes.`} />
                  </>
                ) : (
                  <p className="nc-t-lead">Según lo que contás, respondés a tiempo todas las consultas.</p>
                )}
                {/* Del número a la acción, sin bajar dos pantallas (auditoría mobile, D4). */}
                <div className="nc-stack nc-gap-12">
                  <Button variant="accent" blockMobile href="#lista">
                    Quiero uno de los dos lugares
                  </Button>
                  <p className="nc-t-body-m nc-muted">Programa piloto para dos inmobiliarias. Nahuel te escribe por WhatsApp.</p>
                </div>
              </div>
            </div>
          </Section>

          <Section theme="ink" className="nc-block nc-paper">
            <div className="nc-stack nc-gap-24">
              <Tag tone="accent">Programa piloto</Tag>
              <Headline size="display-l" title="el programa piloto es para" highlight="dos inmobiliarias." />
            </div>
          </Section>

          <Section id="lista" className="nc-block">
            <div className="nc-split nc-split--diag">
              <div className="nc-split__left">
                <SectionHeader title="anotate en la" highlight="lista de espera." />
              </div>
              <form className="nc-split__right nc-form nc-diag__form" noValidate onSubmit={anotarme}>
                <Field id="w-nombre" label="Tu nombre" error={erroresForm.nombre}>
                  <Input id="w-nombre" autoComplete="name" maxLength={MAX_TEXTO} value={datos.nombre} onChange={(e) => dato("nombre", e.target.value)} invalid={Boolean(erroresForm.nombre)} aria-describedby={erroresForm.nombre ? fieldHelperId("w-nombre") : undefined} />
                </Field>
                <Field id="w-inmobiliaria" label="Tu inmobiliaria" error={erroresForm.inmobiliaria}>
                  <Input id="w-inmobiliaria" autoComplete="organization" maxLength={MAX_TEXTO} value={datos.inmobiliaria} onChange={(e) => dato("inmobiliaria", e.target.value)} invalid={Boolean(erroresForm.inmobiliaria)} aria-describedby={erroresForm.inmobiliaria ? fieldHelperId("w-inmobiliaria") : undefined} />
                </Field>
                <Field id="w-whatsapp" label="Tu WhatsApp" helper="Te escribimos solo por acá. Sin spam." error={erroresForm.whatsapp}>
                  <Input id="w-whatsapp" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Ej.: 11 5555 5555" maxLength={32} value={datos.whatsapp} onChange={(e) => dato("whatsapp", e.target.value)} invalid={Boolean(erroresForm.whatsapp)} aria-describedby={fieldHelperId("w-whatsapp")} />
                </Field>
                {/* Mail opcional (Nahuel, 20/11). */}
                <Field id="w-mail" label="Tu mail (opcional)" error={erroresForm.mail}>
                  <Input id="w-mail" type="email" inputMode="email" autoComplete="email" maxLength={MAX_MAIL} value={datos.mail} onChange={(e) => dato("mail", e.target.value)} invalid={Boolean(erroresForm.mail)} aria-describedby={erroresForm.mail ? fieldHelperId("w-mail") : undefined} />
                </Field>
                <div aria-live="polite">
                  {estado === "sending" ? <p className="nc-t-body-m nc-muted">Enviando tus datos.</p> : null}
                  {estado === "duplicate" ? <FormStatus tone="success">Ese número ya está en la lista. Nahuel te escribe por WhatsApp.</FormStatus> : null}
                </div>
                {estado === "error" ? <FormStatus tone="error">No pudimos enviar tus datos. Probá de nuevo o escribinos por Instagram.</FormStatus> : null}
                <div className="nc-stack nc-gap-12">
                  <Button type="submit" variant="accent" blockMobile disabled={estado === "sending"}>
                    Anotarme en la lista
                  </Button>
                  <p className="nc-t-body-m nc-muted">Al anotarte aceptás que te escribamos por WhatsApp. Nahuel te escribe por ahí.</p>
                </div>
                <p className="nc-t-body-m nc-muted">
                  Guardamos tus datos y tus respuestas del diagnóstico para escribirte sobre el programa piloto y para saber por dónde llegaste. No los vendemos. El píxel de Meta solo registra que te anotaste, sin tu nombre, tu WhatsApp ni tu mail. Para ver, corregir o borrar tus datos, respondé el mensaje de Nahuel o escribinos por Instagram.
                </p>
              </form>
            </div>
          </Section>
        </>
      ) : null}
    </main>
  );
}
