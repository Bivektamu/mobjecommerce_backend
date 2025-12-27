import path from "path";
import fs from 'fs'
import { ProductImage, inputProductImg } from "../types";
import mongoose from "mongoose";

const deleteImage = async (image: string) => {
  const link = image.split('upload')[1]
  const imgPath = path.join(process.cwd(), 'public/upload', link)
  try {
    fs.unlinkSync(imgPath);
  } catch (err ) {
    if(err instanceof Error)
      console.log(err.message);
  }
}

export default deleteImage