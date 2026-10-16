const AU_PHONE_PATTERN = /^(?:\+61[2378]\d{8}|\+614\d{8}|0[2378]\d{8}|04\d{8}|1300\d{6}|1800\d{6})$/

export const isValidAustralianPhone = (value: string): boolean => {
  const compact = value.trim().replace(/[\s()-]/g, '')
  return AU_PHONE_PATTERN.test(compact)
}

export const isValidAustralianDate = (value: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return false
  }

  const [dayText, monthText, yearText] = value.split('/')
  const day = Number(dayText)
  const month = Number(monthText)
  const year = Number(yearText)

  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}
