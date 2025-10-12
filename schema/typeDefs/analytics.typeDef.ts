import gql from "graphql-tag"

/* 
type CompletedOrder {
    _id: ID!
    total: Float!,
    orderPlaced: Date!,
    items: [CompletedOrderProductId!]!
}

type CompletedOrderProductId {
    productId: CompletedOrderProduct!
}
type CompletedOrderProduct {
    _id: ID!
    category: String!
}
    type YearlyStats {
        totalOrders: Int!,
        totalSales: Float,
        totalUsers: Int!,
    }

*/

const analyticsTypeDef = gql`

    type LowStockProduct {
        id: ID!,
        title: String!,
        sku: String!,
        quantity: Int!,
    }
    
    

    type OrderItemsCategoryCounter {
        category: String!,
        count: Int!
    }
    
    type SalesAnalytics {
        sales: Float!,
        changeInSales: Float!
    }
    type OrderAnalytics {
        orders: Float!,
        changeInOrders: Float!
    }

    
    type UserAnalytics {
        users: Int!,
        changeInUsers: Float!
    }

    type Sale {
        date: Date!,
        sales: Float!
    }

    type LowProduct {
        _id: ID!,
        title: String!,
        quantity: Int!,
        heroImg: String!,
        sku:String!
    }

    type Query {
        orderAnalytics: OrderAnalytics
        salesAnalytics: SalesAnalytics
        userAnalytics: UserAnalytics
        totalLowStockProducts: [LowStockProduct],
        salesOverTime: [Sale],
        lowStockProducts: [LowProduct],
        ordersByCategory: [OrderItemsCategoryCounter]
    }

`
export default analyticsTypeDef