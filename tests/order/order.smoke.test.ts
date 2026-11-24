import { seedOrder, seedProduct } from "../helpers/seed";
import {
  expectNoErrors,
  getErrorCode,
  graphQL,
  logInAsAdmin,
  registerAndLogin,
} from "../helpers/testClient";

const ORDERS_QUERY = `
  query Orders {
    orders {
      id
      orderNumber
      status
      total
      items {
        productId
        quantity
      }
    }
  }
`;

const USER_ORDERS_QUERY = `
  query UserOrders($id: ID) {
    userOrders(id: $id) {
      id
      orderNumber
      userId
      status
      total
    }
  }
`;

const ORDER_BY_NUMBER_QUERY = `
  query OrderByNumber($orderNumber: String) {
    orderByNumber(orderNumber: $orderNumber) {
      id
      orderNumber
      status
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = `
  mutation UpdateOrderStatus($input: OrderStatus) {
    updateOrderStatus(input: $input)
  }
`;

describe("order smoke suite", () => {
  it("lists seeded orders as an admin", async () => {
    const admin = await logInAsAdmin();
    const customer = await registerAndLogin({ email: "order.owner@example.com" });
    const product = await seedProduct({ slug: "ordered-product" });
    const order = await seedOrder({
      userId: customer.userId,
      productId: product.id,
      orderNumber: "ORD-ADMIN-LIST",
    });

    const response = await graphQL({
      query: ORDERS_QUERY,
      token: admin.accessToken,
    });

    expectNoErrors(response);
    const orders = response.body.data.orders;
    expect(orders.length).toBe(1);
    expect(orders[0].orderNumber).toBe(order.orderNumber);
    expect(orders[0].status).toBe("PENDING");
    expect(orders[0].items.length).toBe(1);
  });

  it("lists the orders of one user", async () => {
    const admin = await logInAsAdmin();
    const customer = await registerAndLogin({ email: "user.orders@example.com" });
    const product = await seedProduct({ slug: "user-ordered-product" });
    const order = await seedOrder({
      userId: customer.userId,
      productId: product.id,
      orderNumber: "ORD-USER-LIST",
    });

    const response = await graphQL({
      query: USER_ORDERS_QUERY,
      variables: { id: customer.userId },
      token: admin.accessToken,
    });

    expectNoErrors(response);
    const orders = response.body.data.userOrders;
    expect(orders.length).toBe(1);
    expect(orders[0].id).toBe(order.id);
    expect(orders[0].orderNumber).toBe("ORD-USER-LIST");
  });

  it("fetches an order by order number", async () => {
    const admin = await logInAsAdmin();
    const customer = await registerAndLogin({ email: "order.number@example.com" });
    const product = await seedProduct({ slug: "number-ordered-product" });
    await seedOrder({
      userId: customer.userId,
      productId: product.id,
      orderNumber: "ORD-BY-NUMBER",
    });

    const response = await graphQL({
      query: ORDER_BY_NUMBER_QUERY,
      variables: { orderNumber: "ORD-BY-NUMBER" },
      token: admin.accessToken,
    });

    expectNoErrors(response);
    expect(response.body.data.orderByNumber.orderNumber).toBe("ORD-BY-NUMBER");
  });

  it("updates the status of a seeded order as an admin", async () => {
    const admin = await logInAsAdmin();
    const customer = await registerAndLogin({ email: "order.status@example.com" });
    const product = await seedProduct({ slug: "status-ordered-product" });
    const order = await seedOrder({
      userId: customer.userId,
      productId: product.id,
      orderNumber: "ORD-STATUS-CHANGE",
      status: "PENDING",
    });

    const updateResponse = await graphQL({
      query: UPDATE_ORDER_STATUS_MUTATION,
      variables: { input: { id: order.id, status: "SHIPPED" } },
      token: admin.accessToken,
    });

    expectNoErrors(updateResponse);
    expect(updateResponse.body.data.updateOrderStatus).toBe("SHIPPED");

    const fetchResponse = await graphQL({
      query: ORDER_BY_NUMBER_QUERY,
      variables: { orderNumber: "ORD-STATUS-CHANGE" },
      token: admin.accessToken,
    });
    expect(fetchResponse.body.data.orderByNumber.status).toBe("SHIPPED");
  });

  it("rejects a status update from a customer", async () => {
    const customer = await registerAndLogin({ email: "order.customer@example.com" });
    const product = await seedProduct({ slug: "customer-ordered-product" });
    const order = await seedOrder({
      userId: customer.userId,
      productId: product.id,
      orderNumber: "ORD-CUSTOMER-DENIED",
    });

    const response = await graphQL({
      query: UPDATE_ORDER_STATUS_MUTATION,
      variables: { input: { id: order.id, status: "CANCELLED" } },
      token: customer.accessToken,
    });

    expect(getErrorCode(response)).toBe("WRONG_USER_TYPE");
  });
});
