import path from "path";
import fs from 'fs'
import { inputProductImg } from "../types";
import mongoose from "mongoose";

const uploadImage = async (item: inputProductImg, folder: string, name: string) => {

  try {
    const file = await item.img

    const { createReadStream, filename } = file;

    const stream = createReadStream()
    const directory = path.join(process.cwd(), folder)

    // Check if the directory exists
    if (!fs.existsSync(directory)) {
      // Create the directory (and any necessary subdirectories)
      console.log(folder);

      fs.mkdirSync(directory, { recursive: true });
    }

    let newName = filename as string

    newName = name + '-' + item._id + path.extname(filename)

    const pathName = path.join(directory, newName)

    stream.pipe(fs.createWriteStream(pathName))

    const url = `https://ecommerce-backend-ruby-rho.vercel.app${folder.replace('public', '')}/${newName}`

    const uploadedImage = {
      _id: item._id,
      url,
      fileName: newName
    }

    return uploadedImage

  } catch (error) {
    console.log(error);
    
    throw error

  }
}

export default uploadImage