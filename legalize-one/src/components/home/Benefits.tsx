import { IconCircle } from '@/components/ui/IconCircle'
import { benefits } from '@/data/content'

export function Benefits() {
  return (
    <section id="sobre" aria-label="Diferenciais Legalize" className="bg-sand pt-12 pb-14 sm:pt-14">
      <div className="container-page">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
          {benefits.map((benefit, i) => (
            <li
              key={benefit.title}
              className={
                'flex flex-col items-center px-2 text-center lg:px-6 ' +
                (i > 0 ? 'lg:border-l lg:border-navy-950/10 ' : '') +
                (i === benefits.length - 1 ? 'col-span-2 sm:col-span-1' : '')
              }
            >
              <IconCircle icon={benefit.icon} />
              <h3 className="mt-3.5 max-w-[200px] font-display text-[14.5px] leading-snug font-semibold tracking-[-0.015em] text-balance text-navy-950">
                {benefit.title}
              </h3>
              <p className="mt-2 max-w-[200px] text-[12.5px] leading-relaxed text-slate">{benefit.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
