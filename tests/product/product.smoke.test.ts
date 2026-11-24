import { seedProduct } from "../helpers/seed";
import { expectNoErrors, graphQL } from "../helpers/testClient";

const PRODUCTS_QUERY = `
  query Products {
    products {
      id
      title
      slug
      price
      quantity
      category
      stockStatus
    }
  }
`;

const PRODUCT_QUERY = `
  query Product($id: ID) {
    product(id: $id) {
      id
      title
      slug
      price
      category
    }
  }
`;

describe("product read smoke suite", () => {
  it("lists seeded products", async () => {
    await seedProduct({
      title: "Black Tee",
      slug: "black-tee",
      sku: "TEE-BLK",
      category: "apparel",
    });
    await seedProduct({
      title: "White Tee",
      slug: "white-tee",
      sku: "TEE-WHT",
      category: "apparel",
    });

    const response = await graphQL({ query: PRODUCTS_QUERY });

    expectNoErrors(response);
    const products = response.body.data.products;
    expect(products.length).toBe(2);
    const slugs = products.map((product: { slug: string }) => product.slug);
    expect(slugs).toContain("black-tee");
    expect(slugs).toContain("white-tee");
  });

  it("fetches a product by id", async () => {
    const product = await seedProduct({
      title: "Amber Hoodie",
      slug: "amber-hoodie",
      price: 60,
      sku: "HOODIE-AMB",
      category: "outerwear",
    });

    const response = await graphQL({
      query: PRODUCT_QUERY,
      variables: { id: product.id },
    });

    expectNoErrors(response);
    expect(response.body.data.product.id).toBe(product.id);
    expect(response.body.data.product.title).toBe("Amber Hoodie");
    expect(response.body.data.product.slug).toBe("amber-hoodie");
  });
});
