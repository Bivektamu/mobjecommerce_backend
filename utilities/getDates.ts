const getDates = () => {


const now = new Date()
const currentYear = (now).getUTCFullYear()

const currentMonth = (now).getUTCMonth()


 const currentEndDate = new Date()
 const currentStartDate = new Date(currentEndDate)
currentStartDate.setDate(currentStartDate.getDate() - 30)

 const pastEndDate = new Date(currentStartDate)
pastEndDate.setDate(pastEndDate.getDate() - 1)

 const pastStartDate = new Date(pastEndDate)
pastStartDate.setDate(pastEndDate.getDate() - 30)

let startDate
if (currentMonth >= 7) {
    startDate = new Date(currentYear, 7, 1)
}
else {
    startDate = new Date(currentYear - 1, 7, 1)
}
 const startFiscalDate = startDate
 const endFiscalDate = new Date()

 return {
    currentStartDate,
    currentEndDate,
    pastStartDate,
    pastEndDate
 }

}


export default getDates
