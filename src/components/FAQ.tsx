"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { faqs } from "@/lib/content";
import { EASE } from "@/lib/motion";

/**
 * FAQ — the breather between the pinned scenes. A framed intro, then an
 * accordion (one panel open at a time). Selecting a question expands its answer
 * and reveals it word by word — the reveal is the effect. Accessible and
 * reduced-motion-aware.
 */
export function FAQ() {
  const reduce = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const wordsContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.018, delayChildren: 0.12 } },
  };
  const wordItem: Variants = reduce
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
      };

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-gris-sutil px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-14 sm:mb-20"
        >
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.45em] text-ambar">
            preguntas
          </p>
          <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-hueso sm:text-7xl">
            Antes de empezar
          </h2>
        </motion.div>

        <ul className="border-t border-gris-sutil">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <motion.li
                key={faq.question}
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, ease: EASE, delay: index * 0.06 }}
                className="border-b border-gris-sutil"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={`font-display text-lg font-medium transition-colors duration-200 sm:text-xl ${
                        isOpen ? "text-hueso" : "text-hueso/80"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                      <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-ambar" />
                      <span
                        className={`absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-ambar transition-transform duration-300 ease-out ${
                          isOpen ? "scale-y-0" : "scale-y-100"
                        }`}
                      />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={panelId}
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        variants={wordsContainer}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl pb-6 pr-8 text-base leading-relaxed text-gris"
                      >
                        {faq.answer.split(" ").map((word, wordIndex) => (
                          <motion.span
                            key={`${word}-${wordIndex}`}
                            variants={wordItem}
                            className="mr-[0.25em] inline-block"
                          >
                            {word}
                          </motion.span>
                        ))}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
