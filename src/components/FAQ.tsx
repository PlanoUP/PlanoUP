"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faq } from "@/data/faq";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-py bg-surface/40">
      <div className="container-px mx-auto max-w-content">
        <h2 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          PERGUNTAS FREQUENTES
        </h2>

        <div className="mt-10 flex max-w-3xl flex-col gap-3">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="card-surface overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-white sm:text-base">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-accent transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-text-secondary">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
