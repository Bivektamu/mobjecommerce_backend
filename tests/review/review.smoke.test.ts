import { seedProduct } from "../helpers/seed";
import {
  expectNoErrors,
  getErrorCode,
  graphQL,
  logInAsAdmin,
  registerAndLogin,
} from "../helpers/testClient";

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($input: CreateReview) {
    createReview(input: $input) {
      id
      userId
      productId
      rating
      review
    }
  }
`;

const PRODUCT_REVIEWS_QUERY = `
  query ProductReviews($id: ID) {
    productReviews(id: $id) {
      id
      rating
      review
      userId {
        _id
        firstName
        email
      }
    }
  }
`;

const EDIT_REVIEW_MUTATION = `
  mutation EditReview($input: EditReview) {
    editReview(input: $input) {
      id
      rating
      review
    }
  }
`;

const DELETE_REVIEW_MUTATION = `
  mutation DeleteReview($id: ID) {
    deleteReview(id: $id) {
      success
    }
  }
`;

const REVIEWS_QUERY = `
  query Reviews {
    reviews {
      id
      rating
      review
      userId {
        firstName
        email
      }
      productId {
        title
      }
    }
  }
`;

describe("review smoke suite", () => {
  it("creates a review and lists it under productReviews with the user populated", async () => {
    const customer = await registerAndLogin({ email: "reviewer@example.com" });
    const product = await seedProduct({ slug: "reviewed-product" });

    const createResponse = await graphQL({
      query: CREATE_REVIEW_MUTATION,
      variables: {
        input: {
          userId: customer.userId,
          productId: product.id,
          rating: 5,
          review: "Excellent quality.",
        },
      },
      token: customer.accessToken,
    });

    expectNoErrors(createResponse);
    expect(createResponse.body.data.createReview.id).toBeTruthy();

    const listResponse = await graphQL({
      query: PRODUCT_REVIEWS_QUERY,
      variables: { id: product.id },
    });

    expectNoErrors(listResponse);
    const reviews = listResponse.body.data.productReviews;
    expect(reviews.length).toBe(1);
    expect(reviews[0].userId._id).toBe(customer.userId);
    expect(reviews[0].userId.email).toBe("reviewer@example.com");
    expect(reviews[0].rating).toBe(5);
  });

  it("requires a customer to create a review", async () => {
    const admin = await logInAsAdmin();
    const product = await seedProduct({ slug: "reviewed-by-admin" });

    const response = await graphQL({
      query: CREATE_REVIEW_MUTATION,
      variables: {
        input: {
          userId: admin.userId,
          productId: product.id,
          rating: 5,
          review: "Should not pass.",
        },
      },
      token: admin.accessToken,
    });

    expect(getErrorCode(response)).toBe("WRONG_USER_TYPE");
  });

  it("edits and deletes a review", async () => {
    const customer = await registerAndLogin({ email: "review.editor@example.com" });
    const product = await seedProduct({ slug: "edited-product" });

    const createResponse = await graphQL({
      query: CREATE_REVIEW_MUTATION,
      variables: {
        input: {
          userId: customer.userId,
          productId: product.id,
          rating: 5,
          review: "First draft.",
        },
      },
      token: customer.accessToken,
    });
    const reviewId = createResponse.body.data.createReview.id;

    const editResponse = await graphQL({
      query: EDIT_REVIEW_MUTATION,
      variables: {
        input: { id: reviewId, rating: 4, review: "Second draft." },
      },
      token: customer.accessToken,
    });

    expectNoErrors(editResponse);
    expect(editResponse.body.data.editReview.id).toBe(reviewId);

    const listResponse = await graphQL({
      query: PRODUCT_REVIEWS_QUERY,
      variables: { id: product.id },
    });
    expect(listResponse.body.data.productReviews[0].rating).toBe(4);
    expect(listResponse.body.data.productReviews[0].review).toBe("Second draft.");

    const deleteResponse = await graphQL({
      query: DELETE_REVIEW_MUTATION,
      variables: { id: reviewId },
      token: customer.accessToken,
    });

    expectNoErrors(deleteResponse);
    expect(deleteResponse.body.data.deleteReview.success).toBe(true);

    const afterDelete = await graphQL({
      query: PRODUCT_REVIEWS_QUERY,
      variables: { id: product.id },
    });
    expect(afterDelete.body.data.productReviews.length).toBe(0);
  });

  it("lists all reviews for an admin with product populated", async () => {
    const customer = await registerAndLogin({ email: "admin.reviews@example.com" });
    const product = await seedProduct({ slug: "listed-product", title: "Listed Tee" });

    await graphQL({
      query: CREATE_REVIEW_MUTATION,
      variables: {
        input: {
          userId: customer.userId,
          productId: product.id,
          rating: 5,
          review: "Seen by admin.",
        },
      },
      token: customer.accessToken,
    });

    const admin = await logInAsAdmin();
    const response = await graphQL({
      query: REVIEWS_QUERY,
      token: admin.accessToken,
    });

    expectNoErrors(response);
    const reviews = response.body.data.reviews;
    expect(reviews.length).toBe(1);
    expect(reviews[0].userId.firstName).toBe("Jane");
    expect(reviews[0].productId.title).toBe("Listed Tee");
  });
});
