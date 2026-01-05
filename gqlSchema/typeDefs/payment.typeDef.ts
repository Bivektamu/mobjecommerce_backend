import gql from "graphql-tag";

const paymentTypeDef = gql`
    type CreatePaymentIntentResponse {
        clientSecret: String!
        orderId:ID!
    }

    
input BillingAddressInput {
    street: String!,
    building: String,
    city: String!,
    postcode: String!,
    state: String!,
    country: String!,
}

    input CreateOrderInput {
        items: [OrderItemInput!]!
        shippingAddress: AddressInput!
    } 

type Query {
    orderByPaymentIntent(paymentIntentId: String!): Order
}
  type Mutation {
        createPaymentIntent(input: CreateOrderInput!): CreatePaymentIntentResponse!
    }
`

export default paymentTypeDef