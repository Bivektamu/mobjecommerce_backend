import fs from 'fs'
import path from "path";

import Product from "../../dataLayer/schema/Product";
import verifyUser from "../../utilities/verifyUser";
import uploadImage from "../../utilities/uploadImage";
import { inputProductImg, ProductImage } from '../../typeDefs';
import deleteImages from '../../utilities/deleteImages';


const productResolver = {
  Query: {
    products: async (parent: any, args: any, context: any) => {
      
      const products = await Product.find()
      return products
    },
    product: async (parent: any, args: any, context: any) => {

      const id = args.id
      const findproduct = await Product.findById(id)
      return findproduct
    }
  },

  Mutation: {
    createProduct: async (parent: any, args: any, context: any) => {

      if (!context.token) {
        throw new Error('Not Authenticated')
      }

      const admin = verifyUser(context.token)
      if (!admin) {
        throw new Error('Not Authenticated')
      }

      try {

        const { title, slug, description, colors, sizes, price, category, quantity, sku, stockStatus, featured, imgs } = args.input

        const productExists = await Product.findOne({ slug: slug.toLowerCase() })
        if (productExists) {
          throw new Error('Product Already Exists')
        }

        const folder = `products/${category}/`


        const uploadPromises = imgs.map((item: inputProductImg) => uploadImage(item, slug, folder))
        const newImgs = await Promise.all(uploadPromises);

        const newProduct = new Product({
          title, slug, description, colors, sizes, price, quantity, category, sku, stockStatus, featured, imgs: newImgs
        })

        return await newProduct.save()
      } catch (error) {
        if (error) {

          throw error
        }
      }
    },

    editProduct: async (parent: any, args: any, context: any) => {
      try {

        if (!context.token) {
          throw new Error('Not Authenticated')
        }

        const admin = verifyUser(context.token)
        if (!admin) {
          throw new Error('Not Authenticated')
        }

        const { title, slug, description, colors, sizes, price, category, quantity, sku, stockStatus, featured, newImgs, oldImgs, id } = args.input

        const productExists = await Product.findById(id)
        if (!productExists) {
          throw new Error('Product does not Exist')
        }

        let toUpdateImgs = [...oldImgs]

        // loop thorugh old images and filter out if its its exists in new images or not
        if (productExists.imgs.length > oldImgs.length) {
          const imgToDelete = productExists.imgs.filter(img => oldImgs.findIndex((oldImg: any) => oldImg.id === img.id) < 0).map(img => img.url)
          console.log(imgToDelete)
          deleteImages(imgToDelete)
        }

        if (newImgs.length > 0) {
          const folder = `products/${category}/`
          const uploadPromises = newImgs.map((item: inputProductImg) => uploadImage(item, slug, folder))
          const uploadedImgs = await Promise.all(uploadPromises);
          toUpdateImgs = [...toUpdateImgs, ...uploadedImgs]
        }

        try {
          const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
              title, slug, description, colors, sizes, price, category, quantity, sku, stockStatus, featured, imgs: toUpdateImgs
            },
            { new: true }
          )

          return updatedProduct

        } catch (error) {
          if (error) throw error
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message)
        }
      }
    },

    // Delete Product Mutation
    deleteProduct: async (parent: any, args: any, context: any) => {
      try {

        if (!context.token) {
          throw new Error('Not Authenticated')
        }

        const admin = verifyUser(context.token)
        if (!admin) {
          throw new Error('Not Authenticated')
        }

        const { id } = args

        const product = await Product.findById(id)
        if (product) {
          const imgstoDelete = product.imgs.map(img => img.url)

          deleteImages(imgstoDelete)

          const deletedProduct = await Product.findByIdAndDelete(id)
          if (deletedProduct) {
            return {
              success: true,
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
      }
    }

  }
};

export default productResolver