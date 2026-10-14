import { useState } from 'react'
import Icon from '../Icon.jsx'

/**
 * FAQ accordion (§0.9). Multiple items can be open at once (state is a Set); all closed on load.
 * items: [{ id, question, answer }] where answer is a string, or an array of paragraph nodes (multi-paragraph).
 */
export default function Faq({ items }) {
  const [open, setOpen] = useState(() => new Set())
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
        <ul className="flex flex-col divide-y divide-white/5 border-x-[1.5px] border-white/5">
          {items.map(({ id, question, answer }) => {
            const isOpen = open.has(id)
            return (
              <li key={id}>
                <h3>
                  <button
                    type="button"
                    id={`faq-${id}-question`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${id}-answer`}
                    onClick={() => toggle(id)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-6 px-4 py-5 text-left text-lg font-medium leading-[150%] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white md:px-[34px] md:py-6"
                  >
                    {question}
                    <Icon
                      name="chevron-right"
                      className={`size-5 shrink-0 text-white/50 transition-[rotate,color] duration-300 group-hover:text-white motion-reduce:transition-none ${
                        isOpen ? '[rotate:-90deg]' : '[rotate:90deg]'
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-${id}-answer`}
                  role="region"
                  aria-labelledby={`faq-${id}-question`}
                  inert={isOpen ? undefined : ''}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    {Array.isArray(answer) ? (
                      <div className="flex max-w-[800px] flex-col gap-3 px-4 pb-6 md:px-[34px]">
                        {answer.map((p, i) => (
                          <p key={i} className="leading-[150%] text-white/60">
                            {p}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="max-w-[800px] px-4 pb-6 leading-[150%] text-white/60 md:px-[34px]">{answer}</p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
