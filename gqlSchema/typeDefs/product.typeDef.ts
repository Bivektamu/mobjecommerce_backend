import gql from "graphql-tag";
// input EditProduct {

//     newImgs:[inputProductImgWithUrl!],
// }
const productTypeDef = gql`

    enum Color {
        BLACK,
        RED,
        GRAY,
        WHITE,
        AMBER 
    }
    enum Size {
        S,
        M,
        L,
        XL
    }
    type ProductImg {
        id:ID!
        url:String!
    }
   
    type Product {
        id: ID!,
        title: String!,
        slug: String!,
        description: String!,
        colors: [Color!]!,
        sizes: [Size!]!,
        price: Int!,
        quantity: Int!,
        imgs:[ProductImg!]!,
        category:String!,
        sku: String!,
        stockStatus: Boolean!,
        featured: Boolean!
    }

    input inputProductImg {
        img:Upload!
        _id: ID!
    }

     input inputProductImgWithUrl {
        id:ID!
        url:String!
    }

    input CreateProduct {
        title: String!,
        slug: String!,
        description: String!,
        colors: [Color!]!,
        sizes: [Size!]!,
        price: Int!,
        quantity: Int!,
        category:String!,
        sku: String!,
        stockStatus: Boolean!,
        featured: Boolean!,
        imgs:[inputProductImg!]!,
    }

    input EditProduct {
        id:ID!,
        title: String!,
        slug: String!,
        description: String!,
        colors: [Color!]!,
        sizes: [Size!]!,
        price: Int!,
        quantity: Int!,
        category:String!,
        sku: String!,
        stockStatus: Boolean!,
        featured: Boolean!,
        oldImgs:[inputProductImgWithUrl!],
        newImgs:[inputProductImg!],
    }

    type Query {
        products: [Product],
        product(id:ID): Product,
    }

    type Mutation {
        createProduct(input:CreateProduct): Product
        deleteProduct(id: ID): ReturnType
        editProduct(input:EditProduct): Product

    }
`

export default productTypeDef