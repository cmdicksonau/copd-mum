interface EmergencyBarProps {
  carerPhone?: string
}

export const EmergencyBar = ({ carerPhone }: EmergencyBarProps) => {
  const carerHref = carerPhone ? `tel:${carerPhone}` : undefined

  return (
    <header className="sticky top-0 z-50 border-b-2 border-slate-900 bg-red-700 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3">
        <p className="text-base font-bold">Emergency escalation is always available</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:000"
            className="inline-flex min-h-12 min-w-32 items-center justify-center rounded-lg border-2 border-white bg-white px-5 py-2 text-base font-bold text-red-800"
          >
            Call 000
          </a>
          <a
            href={carerHref}
            className="inline-flex min-h-12 min-w-32 items-center justify-center rounded-lg border-2 border-white px-5 py-2 text-base font-bold"
            aria-disabled={!carerHref}
            onClick={(event) => {
              if (!carerHref) {
                event.preventDefault()
              }
            }}
          >
            Call Carer
          </a>
        </div>
      </div>
    </header>
  )
}
