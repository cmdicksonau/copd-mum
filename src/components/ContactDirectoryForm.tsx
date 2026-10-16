import type { AustralianMedicalContact } from '../types/domain'

export interface ContactDirectoryValue {
  displayName: string
  dateOfBirth: string
  contacts: {
    gp: AustralianMedicalContact
    specialist: AustralianMedicalContact
    emergencyCarer: AustralianMedicalContact
  }
}

interface ContactDirectoryFormProps {
  value: ContactDirectoryValue
  phoneErrors: Partial<Record<'gp' | 'specialist' | 'emergencyCarer', string>>
  dateError?: string
  onChange: (next: ContactDirectoryValue) => void
}

export const ContactDirectoryForm = ({
  value,
  phoneErrors,
  dateError,
  onChange,
}: ContactDirectoryFormProps) => {
  const updateContact = (
    key: 'gp' | 'specialist' | 'emergencyCarer',
    field: keyof AustralianMedicalContact,
    fieldValue: string,
  ) => {
    onChange({
      ...value,
      contacts: {
        ...value.contacts,
        [key]: {
          ...value.contacts[key],
          [field]: fieldValue,
        },
      },
    })
  }

  return (
    <section className="space-y-6 rounded-2xl border-2 border-slate-900 bg-white p-5">
      <h2 className="text-xl font-bold text-slate-950">Medical profile</h2>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-base font-semibold text-slate-900">Patient name</span>
          <input
            className="min-h-12 rounded-lg border-2 border-slate-400 px-3 text-base"
            value={value.displayName}
            onChange={(event) => onChange({ ...value, displayName: event.target.value })}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-base font-semibold text-slate-900">Date of birth (DD/MM/YYYY)</span>
          <input
            className="min-h-12 rounded-lg border-2 border-slate-400 px-3 text-base"
            placeholder="DD/MM/YYYY"
            value={value.dateOfBirth}
            onChange={(event) => onChange({ ...value, dateOfBirth: event.target.value })}
          />
          {dateError ? <span className="text-sm font-semibold text-red-800">{dateError}</span> : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {([
          { key: 'gp', heading: 'General Practitioner (GP)', relationshipLabel: 'Clinic' },
          { key: 'specialist', heading: 'Respiratory Specialist', relationshipLabel: 'Clinic' },
          { key: 'emergencyCarer', heading: 'Personal Emergency Contact', relationshipLabel: 'Relationship' },
        ] as const).map((section) => (
          <fieldset key={section.key} className="grid gap-2 rounded-xl border border-slate-300 p-3">
            <legend className="px-1 text-sm font-bold text-slate-900">{section.heading}</legend>
            <input
              className="min-h-12 rounded-lg border border-slate-400 px-3 text-base"
              placeholder="Full name"
              value={value.contacts[section.key].name}
              onChange={(event) => updateContact(section.key, 'name', event.target.value)}
            />
            <input
              className="min-h-12 rounded-lg border border-slate-400 px-3 text-base"
              placeholder={section.relationshipLabel}
              value={value.contacts[section.key].clinicOrRelationship || ''}
              onChange={(event) => updateContact(section.key, 'clinicOrRelationship', event.target.value)}
            />
            <input
              className="min-h-12 rounded-lg border border-slate-400 px-3 text-base"
              placeholder="Phone (02, 03, 07, 08, 04, 1300, 1800, +61)"
              value={value.contacts[section.key].phone}
              onChange={(event) => updateContact(section.key, 'phone', event.target.value)}
            />
            {phoneErrors[section.key] ? (
              <span className="text-sm font-semibold text-red-800">{phoneErrors[section.key]}</span>
            ) : null}
          </fieldset>
        ))}
      </div>
    </section>
  )
}
