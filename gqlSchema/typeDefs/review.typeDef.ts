import gql from "graphql-tag"

const reviewTypeDef = gql`


    type UserDetails {
        _id: ID!,
        firstName: String!,
        lastName: String!,
        email: String!
    }

    type ImgUrl {
        url:String!
    }

    type ProductDetails {
        _id: ID!,
        title: String!,
        imgs: [ImgUrl]!,
    }


    type Review {
        id: ID!,
        userId: ID!,
        productId: ID!,
        rating: Int!,
        review: String!,
        createdAt:Date!,
        updateAt: Date
    }

    
    type ReviewWithUser {
        id: ID!,
        userId: UserDetails!,
        productId: ID!,
        rating: Int!,
        review: String!,
        createdAt:Date!,
        updateAt: Date
    }

    type DetailedReview {
        id: ID!,
        userId: UserDetails!,
        productId: ProductDetails!,
        rating: Int!,
        review: String!,
        createdAt:Date!,
        updateAt: Date
    }
    
   

    input CreateReview {
        userId: ID!,
        productId: ID!,
        rating: Int!,
        review: String!
    }
    
    input EditReview {
        id:ID!,
        rating: Int!,
        review: String!
    }
    type Mutation {
        createReview(input:CreateReview):Review
        editReview(input:EditReview):Review
        deleteReview(id:ID):ReturnType
    }

     type Query {
        productReviews(id: ID): [ReviewWithUser]
        reviews:[DetailedReview]
    }

`

export default reviewTypeDef