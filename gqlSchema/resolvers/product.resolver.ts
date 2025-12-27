import fs from 'fs'
import path from "path";

import Product from "../../dataLayer/schema/Product";
import verifyUser from "../../utilities/verifyUser";
import uploadImage from "../../utilities/uploadImage";
import { ErrorCode, inputProductImg, ProductImage, UserRole } from '../../types';
import deleteImages from '../../utilities/deleteImages';
import { GraphQLError } from 'graphql';


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
        throw new GraphQLError('Not Authenticated', {
          extensions: {
            code: ErrorCode.JWT_TOKEN_MISSING
          }
        })
      }

      const user = verifyUser(context.token)

      if (!user) {
        throw new GraphQLError('User not verified', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (user.role !== UserRole.ADMIN) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }

      const { title, slug, description, colors, sizes, price, category, quantity, sku, stockStatus, featured, imgs } = args.input

      const productExists = await Product.findOne({ slug: slug.toLowerCase() })
      if (productExists) {
        throw new GraphQLError('Product already exists', {
          extensions: {
            code: ErrorCode.ALREADY_EXISTS,
          }
        })
      }

      const folder = `products/${category}/`


      const uploadPromises = imgs.map((item: inputProductImg) => uploadImage(item, slug, folder))
      const newImgs = await Promise.all(uploadPromises);

      const newProduct = new Product({
        title, slug, description, colors, sizes, price, quantity, category, sku, stockStatus, featured, imgs: newImgs
      })

      return await newProduct.save()

    },

    editProduct: async (parent: any, args: any, context: any) => {

      if (!context.token) {
        throw new GraphQLError('Not Authenticated', {
          extensions: {
            code: ErrorCode.JWT_TOKEN_MISSING
          }
        })
      }

      const user = verifyUser(context.token)

      if (!user) {
        throw new GraphQLError('User not verified', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (user.role !== UserRole.ADMIN) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }

      const { title, slug, description, colors, sizes, price, category, quantity, sku, stockStatus, featured, newImgs, oldImgs, id } = args.input

      const productExists = await Product.findById(id)
      if (!productExists) {
        throw new GraphQLError('Product not found', {
          extensions: {
            code: ErrorCode.NOT_FOUND
          } 
        }) 
      }

      let toUpdateImgs = [...oldImgs]

      // loop thorugh old images and filter out if it exists in new images or not
      if (productExists.imgs.length > oldImgs.length) {
        const imgToDelete = productExists.imgs.filter(img => oldImgs.findIndex((oldImg: any) => oldImg.id === img.id) < 0).map(img => img.url)
        deleteImages(imgToDelete)
      }

      if (newImgs.length > 0) {
        const folder = `products/${category}/`
        const uploadPromises = newImgs.map((item: inputProductImg) => uploadImage(item, slug, folder))
        const uploadedImgs = await Promise.all(uploadPromises);
        toUpdateImgs = [...toUpdateImgs, ...uploadedImgs]
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          title, slug, description, colors, sizes, price, category, quantity, sku, stockStatus, featured, imgs: toUpdateImgs
        },
        { new: true }
      )
      return updatedProduct
    },

    // Delete Product Mutation
    deleteProduct: async (parent: any, args: any, context: any) => {
      if (!context.token) {
        throw new GraphQLError('Not Authenticated', {
          extensions: {
            code: ErrorCode.JWT_TOKEN_MISSING
          }
        })
      }

      const user = verifyUser(context.token)

      if (!user) {
        throw new GraphQLError('User not verified', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (user.role !== UserRole.ADMIN) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
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
    }

  }
};

export default productResolver