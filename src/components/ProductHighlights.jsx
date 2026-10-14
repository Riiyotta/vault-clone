import { CrossMarker } from './GridFrame.jsx'
import LottieCanvas from './LottieCanvas.jsx'
import { useT } from '../i18n/index.jsx'

// Spec §4 — product highlights grid. Copy: productHighlights.cards[<lottie id>] in src/i18n.
const HEADER_PAD = 'pt-3 pr-2 pl-3 md:px-4 md:pt-6 xl:px-6 xl:pt-[26px]'
const HEADER_PAD_NO_X = 'pt-3 px-0 md:pt-6 xl:pt-[26px]'

const CARDS = [
  {
    lottie: 'global-financial-ledger',
    align: [1, 1],
    container: 'h-[calc(100%+2px)] pl-3 pt-px',
    card: 'border-t-0 md:border-r md:border-b',
  },
  {
    lottie: 'web3-integrations',
    align: [0.5, 1],
    container: 'h-full px-2.5 md:px-4 xl:px-6',
    card: 'md:border-t-0 md:border-l lg:border-r',
  },
  {
    lottie: 'custom-financial-reports',
    align: [0.5, 1],
    container: 'h-full px-5 pb-[38px] md:pb-7 lg:px-9 lg:pb-7',
    card: 'md:border-r lg:border-t-0 lg:border-l',
  },
  {
    lottie: 'user-management',
    align: [0.5, 1],
    container: 'h-full px-1.5 md:px-3 xxl:px-0',
    card: 'md:border-l lg:border-r lg:border-b-0 lg:border-l-0',
  },
  {
    soon: true,
    lottie: 'workflow-automations',
    align: [0.5, 1],
    container: 'h-full bg-card-dots bg-dots-14 bg-center pt-4 pb-3 md:py-[18px] lg:pt-4 lg:pb-3',
    card: 'bg-card-fade px-3 pb-[18px] md:px-4 md:pb-4 lg:pb-8 xl:px-6 md:border-r md:border-b-0 lg:border-l',
    headerNoX: true,
  },
  {
    soon: true,
    lottie: 'invoice-builder',
    align: [1, 1],
    container: 'h-[calc(100%+2px)] pl-3',
    card: 'border-b-0 md:border-l',
  },
]

function Badge({ children }) {
  return (
    <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-white shadow-pill lang-uk:text-[12px]">
      {children}
    </span>
  )
}

function Card({ c }) {
  const t = useT()
  const copy = t.productHighlights.cards[c.lottie]
  const title = <h4 className="text-lg font-medium leading-[1.5] text-white">{copy.title}</h4>
  return (
    <article
      className={`relative flex h-[356px] w-full flex-col justify-between gap-8 border-y border-white/5 md:h-[350px] lg:h-[372px] ${c.card}`}
    >
      <CrossMarker className="!absolute -left-1.5 -top-1.5" />
      <CrossMarker className="!absolute -right-1.5 -top-1.5" />
      <CrossMarker className="!absolute -bottom-1.5 -left-1.5" />
      <CrossMarker className="!absolute -bottom-1.5 -right-1.5" />

      <div className={`flex flex-col gap-2 ${c.headerNoX ? HEADER_PAD_NO_X : HEADER_PAD}`}>
        {c.soon ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {title}
            <Badge>{t.productHighlights.soon}</Badge>
          </div>
        ) : (
          title
        )}
        <p className="text-base leading-[1.4] text-white/60 md:text-sm md:leading-[19.6px] xl:text-base xl:leading-[1.4]">
          {copy.description}
        </p>
      </div>

      <div className="relative h-full w-full overflow-hidden md:h-[216px] lg:h-[230px]">
        <div className={`flex w-full ${c.container}`}>
          <LottieCanvas
            src={`/assets/lottie/product-highlights/${c.lottie}.lottie`}
            loop
            autoplay
            layout={{ fit: 'contain', align: c.align }}
            aria-label={copy.ariaLabel}
          />
        </div>
      </div>
    </article>
  )
}

export default function ProductHighlights() {
  return (
    <section id="product" className="flex w-full scroll-mt-10 justify-center">
      <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 border-x-[1.5px] border-white/5 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-[70px]">
          {CARDS.map((c) => (
            <Card key={c.lottie} c={c} />
          ))}
        </div>
      </div>
    </section>
  )
}
