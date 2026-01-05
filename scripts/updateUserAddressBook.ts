import mongoose from "mongoose"
import User from "../dataLayer/schema/User"
import connectDB from "../dataLayer"
import 'dotenv/config'

const updateUserAddressBook = async () => {

    connectDB()

    try {

        console.log('asdf')

        const res = await User.updateMany(
            {
                address: { $exists: true, $type: "object", $not: { $type: "array" } }
            },
            [
                {
                    $set: {
                        address: [
                            {
                                $mergeObjects: [
                                    "$address", {
                                        id: new mongoose.Types.ObjectId(),
                                        label: 'home',
                                        setAsDefault: true
                                    }
                                ]
                            }


                        ]
                    }
                }
            ]

        )
        console.log(`Updated ${res.modifiedCount} count`)
    } catch (error) {
        if (error instanceof Error) console.log(error?.message)

    }
}
updateUserAddressBook()