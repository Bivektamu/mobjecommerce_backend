import gql from "graphql-tag";

const orderTypeDef = gql`
enum Status {
    PENDING,
    COMPLETED,
    PROCESSING,
    CANCELLED,
    FAILED,
    SHIPPED,
    REFUNDED
}

    type OrderItem {
        productId: ID!,
        color: Color!,
        quantity: Int!,
        size: Size!,
    }

    input OrderItemInput {
        productId: ID!,
        color: Color!,
        quantity: Int!,
        size: Size!,
    }
    type Order {
        id: ID!,
        orderNumber: String!,
        userId: ID!,
        status:Status!,
        total: Float!,
        subTotal: Float!,
        tax: Float!,
        items: [OrderItem!]!,
        shippingAddress: Address!
        createdAt: Date!
    }

        input OrderStatus {
            id: ID!,
            status:Status!
        }

    type Query {
        orders(limit:Int): [Order]
        userOrders(id:ID): [Order]
        orderByNumber(orderNumber:String): Order
    }
    
    type Mutation {
        updateOrderStatus(input: OrderStatus):Status
    }
`

export default orderTypeDef