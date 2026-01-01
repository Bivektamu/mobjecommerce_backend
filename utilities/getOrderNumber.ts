import Counter from "../dataLayer/schema/Counter"

const getOrderNumber = async () => {
    const nextSequence = await Counter.findOneAndUpdate(
        {
            _id: 'orderId'
        },
        {
            $inc: { seq: 1 }
        },
        {
            new: true,
            upsert: true
        }
    )
    const year = new Date().getFullYear()
    return `MBJ-${year}-${String(nextSequence.seq).padStart(6, '0')}`
} 

export default getOrderNumber