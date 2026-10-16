import { DEFAULT_LFA_STRATEGIES } from '../types/domain'

interface CustomStrategiesEditorProps {
  value: string[]
  onChange: (next: string[]) => void
}

export const CustomStrategiesEditor = ({ value, onChange }: CustomStrategiesEditorProps) => {
  const addStrategy = () => {
    if (value.length >= 5) {
      return
    }

    onChange([...value, ''])
  }

  const updateStrategy = (index: number, nextValue: string) => {
    const next = [...value]
    next[index] = nextValue
    onChange(next)
  }

  const removeStrategy = (index: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index))
  }

  return (
    <section className="space-y-4 rounded-2xl border-2 border-slate-900 bg-white p-5">
      <h2 className="text-xl font-bold text-slate-950">Recovery strategies</h2>
      <p className="text-base text-slate-800">
        The nine Lung Foundation Australia defaults are always available. Add up to five personal strategies below.
      </p>

      <div className="grid gap-2 rounded-xl border border-slate-300 p-3">
        {DEFAULT_LFA_STRATEGIES.map((strategy) => (
          <p key={strategy.id} className="text-base text-slate-900">
            • {strategy.label}
          </p>
        ))}
      </div>

      <div className="grid gap-3">
        {value.map((entry, index) => (
          <div key={`custom-strategy-${index}`} className="flex items-start gap-2">
            <input
              className="min-h-12 flex-1 rounded-lg border border-slate-400 px-3 text-base"
              placeholder={`Custom strategy ${index + 1}`}
              value={entry}
              onChange={(event) => updateStrategy(index, event.target.value)}
            />
            <button
              type="button"
              className="min-h-12 min-w-12 rounded-lg border-2 border-slate-900 px-3 text-sm font-semibold"
              onClick={() => removeStrategy(index)}
              aria-label={`Remove strategy ${index + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="min-h-12 rounded-xl border-2 border-slate-900 px-4 py-2 text-base font-semibold text-slate-900"
        onClick={addStrategy}
        disabled={value.length >= 5}
      >
        Add custom strategy ({value.length}/5)
      </button>
    </section>
  )
}
