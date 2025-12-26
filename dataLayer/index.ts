import mongoose from "mongoose";
import 'dotenv/config'


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.log('Database successfully Connected')
  } catch (error) 
  {
    console.log(error)
    process.exit(1)
  }
};

export default connectDB