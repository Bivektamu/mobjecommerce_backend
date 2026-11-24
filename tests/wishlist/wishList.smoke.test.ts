import { seedProduct } from "../helpers/seed";
import { expectNoErrors, getErrorCode, graphQL, registerAndLogin } from "../helpers/testClient";

const ADD_TO_WISH_LIST_MUTATION = `
  mutation AddToWishList($input: WishListInput) {
    addToWishList(input: $input) {
      id
      userId
      products {
        id
        createdAt
      }
    }
  }
`;

const WISH_LIST_BY_USER_QUERY = `
  query WishListByUserId($userId: ID) {
    wishListByUserId(userId: $userId) {
      id
      userId
      products {
        id
        createdAt
      }
    }
  }
`;

describe("wishlist smoke suite", () => {
  it("adds a wishlist and reads it back by user id", async () => {
    const customer = await registerAndLogin({ email: "wishlist.owner@example.com" });
    const product = await seedProduct({ slug: "wishlisted-product" });

    const addResponse = await graphQL({
      query: ADD_TO_WISH_LIST_MUTATION,
      variables: {
        input: {
          userId: customer.userId,
          products: [{ id: product.id }],
        },
      },
      token: customer.accessToken,
    });

    expectNoErrors(addResponse);
    expect(addResponse.body.data.addToWishList.userId).toBe(customer.userId);

    const listResponse = await graphQL({
      query: WISH_LIST_BY_USER_QUERY,
      variables: { userId: customer.userId },
      token: customer.accessToken,
    });

    expectNoErrors(listResponse);
    const wishList = listResponse.body.data.wishListByUserId;
    expect(wishList.products.length).toBe(1);
    expect(wishList.products[0].id).toBe(product.id);
  });

  it("requires an authenticated customer to read a wishlist", async () => {
    const customer = await registerAndLogin({ email: "wishlist.guest.denied@example.com" });

    const response = await graphQL({
      query: WISH_LIST_BY_USER_QUERY,
      variables: { userId: customer.userId },
    });

    expect(getErrorCode(response)).toBe("NOT_AUTHENTICATED");
  });
});
