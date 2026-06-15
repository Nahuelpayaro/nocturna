/**
 * Editorial content for the landing, kept out of the components so copy can be
 * edited in one place. Order here is the order rendered on the page.
 */

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "servicios", href: "#servicios" },
  { label: "proyectos", href: "#proyectos" },
  { label: "proceso", href: "#proceso" },
  { label: "contacto", href: "#contacto" },
];

export type Service = {
  title: string;
  description: string;
};

export const services: Service[] = [
  {
    title: "Sitios web",
    description: "Claros, rápidos y pensados para durar. Y para convertir.",
  },
  {
    title: "Branding e identidad",
    description:
      "Un sistema visual completo —logo, paleta, tipografía— para una marca que se recuerda.",
  },
  {
    title: "Redes sociales",
    description: "Presencia y contenido con criterio. Calidad, no ruido.",
  },
  {
    title: "Comunicación digital",
    description:
      "Estrategia y mensaje: lo que conecta tu marca con su público.",
  },
  {
    title: "SEO y Google Maps",
    description:
      "Que te encuentren cuando te buscan. Google y visibilidad local.",
  },
];

export type ProcessStep = {
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    title: "Descubrimiento",
    description: "Entendemos tu negocio, tu público y tus objetivos.",
  },
  {
    title: "Diseño",
    description: "Identidad y diseño a medida. Con tu mirada en cada paso.",
  },
  {
    title: "Desarrollo",
    description: "Lo construimos rápido, moderno y optimizado.",
  },
  {
    title: "Lanzamiento",
    description: "Publicamos, medimos y acompañamos el crecimiento.",
  },
];

export type Project = {
  title: string;
  /** One line on what the piece is. */
  brief: string;
  /** Disciplines involved, e.g. "Branding · Web". */
  disciplines: string;
  /** Honesty tag — "Concepto" until it's real client work. */
  tag: string;
  year: string;
  /**
   * TODO: real screenshot/render path in /public/work (e.g. "/work/lumen.webp").
   * When set, it replaces the placeholder poster automatically.
   */
  image?: string;
  /** On-brand placeholder poster shown while there is no image yet. */
  gradient: string;
};

// Concept work for launch — swap `image` in (and flip `tag` to the client name
// or "Cliente") as real projects ship. Three strong pieces beat six thin ones.
export const projects: Project[] = [
  {
    title: "Lumen",
    brief: "Identidad para una cafetería de especialidad: cálida, mínima, memorable.",
    disciplines: "Branding · Packaging",
    tag: "Concepto",
    year: "2026",
    gradient:
      "radial-gradient(120% 120% at 18% 15%, rgba(217,164,65,0.28) 0%, transparent 52%), linear-gradient(155deg, #1c1c1c 0%, #0a0a0a 70%)",
  },
  {
    title: "Vértigo",
    brief: "Sitio para un estudio de arquitectura: estructura, silencio y escala.",
    disciplines: "Diseño web · Desarrollo",
    tag: "Concepto",
    year: "2026",
    gradient:
      "radial-gradient(130% 110% at 85% 18%, rgba(217,164,65,0.22) 0%, transparent 55%), linear-gradient(200deg, #1c1c1c 0%, #0a0a0a 75%)",
  },
  {
    title: "Nocturna FM",
    brief: "Identidad y motion para un ciclo de música electrónica nocturna.",
    disciplines: "Branding · Motion",
    tag: "Concepto",
    year: "2026",
    gradient:
      "radial-gradient(120% 120% at 50% 100%, rgba(217,164,65,0.25) 0%, transparent 55%), linear-gradient(160deg, #1c1c1c 0%, #0a0a0a 70%)",
  },
];

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "¿Cuánto tarda un proyecto web?",
    answer:
      "Depende del alcance, pero un sitio institucional suele tomar entre 3 y 6 semanas desde el descubrimiento hasta el lanzamiento. Te damos un cronograma claro antes de empezar.",
  },
  {
    question: "¿Cómo son los pagos?",
    answer:
      "Trabajamos con un anticipo para arrancar y el resto contra entrega. Para proyectos más grandes dividimos en etapas. Definimos todo por escrito antes de comenzar.",
  },
  {
    question: "¿Trabajan con negocios de todo el país?",
    answer:
      "Sí. Estamos en Buenos Aires, pero trabajamos de forma remota con marcas de toda la Argentina. Todo el proceso se coordina online.",
  },
  {
    question: "¿Qué necesitan de mí para empezar?",
    answer:
      "Una charla inicial para entender tu negocio y tus objetivos. A partir de ahí nos encargamos del resto y te pedimos feedback en cada etapa.",
  },
  {
    question: "¿Ofrecen mantenimiento después del lanzamiento?",
    answer:
      "Sí. Ofrecemos planes de mantenimiento y mejoras continuas para que tu sitio siga rápido, seguro y actualizado.",
  },
];
