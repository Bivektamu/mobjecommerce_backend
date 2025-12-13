const now = new Date()
const currentYear = (now).getUTCFullYear()

const currentMonth = (now).getUTCMonth()


export const currentEndDate = new Date()
export const currentStartDate = new Date(currentEndDate)
currentStartDate.setDate(currentStartDate.getDate() - 30)

export const pastEndDate = new Date(currentStartDate)
pastEndDate.setDate(pastEndDate.getDate() - 1)

export const pastStartDate = new Date(pastEndDate)
pastStartDate.setDate(pastEndDate.getDate() - 30)

let startDate
if (currentMonth >= 7) {
    startDate = new Date(currentYear, 7, 1)
}
else {
    startDate = new Date(currentYear - 1, 7, 1)
}
export const startFiscalDate = startDate
export const endFiscalDate = new Date()
