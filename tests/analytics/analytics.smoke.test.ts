import { seedOrder, seedProduct, seedUser } from "../helpers/seed";
import { expectNoErrors, graphQL, logInAsAdmin } from "../helpers/testClient";

const ANALYTICS_QUERY = `
  query Analytics {
    orderAnalytics {
      orders
      changeInOrders
    }
    salesAnalytics {
      sales
      changeInSales
    }
    userAnalytics {
      users
      changeInUsers
    }
  }
`;

describe("analytics smoke suite", () => {
  it("reports order, sales, and user analytics from seeded completed orders", async () => {
    const admin = await logInAsAdmin();
    const product = await seedProduct({ slug: "analytics-product" });

    await seedUser({ email: "analytics.one@example.com" });
    await seedUser({ email: "analytics.two@example.com" });

    const firstOrder = await seedOrder({
      userId: admin.userId,
      productId: product.id,
      status: "COMPLETED",
      subTotal: 100,
      tax: 0,
      total: 100,
    });
    await seedOrder({
      userId: admin.userId,
      productId: product.id,
      status: "COMPLETED",
      subTotal: 150,
      tax: 0,
      total: 150,
      orderNumber: `ORD-${firstOrder.orderNumber}-B`,
    });

    const response = await graphQL({
      query: ANALYTICS_QUERY,
      token: admin.accessToken,
    });

    expectNoErrors(response);
    const data = response.body.data;

    expect(data.orderAnalytics.orders).toBe(2);
    expect(data.orderAnalytics.changeInOrders).toBe(100);

    expect(data.salesAnalytics.sales).toBe(250);
    expect(data.salesAnalytics.changeInSales).toBe(100);

    expect(data.userAnalytics.users).toBeGreaterThanOrEqual(3);
    expect(data.userAnalytics.changeInUsers).toBe(100);
  });
});
