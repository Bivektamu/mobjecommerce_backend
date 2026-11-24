import {
  expectNoErrors,
  getErrorCode,
  graphQL,
  logInAsAdmin,
  registerAndLogin,
  registerCustomer,
} from "../helpers/testClient";

const USERS_QUERY = `
  query Users {
    users {
      id
      firstName
      lastName
      email
      role
    }
  }
`;

const USER_QUERY = `
  query User($id: ID) {
    user(id: $id) {
      id
      firstName
      lastName
      email
    }
  }
`;

const UPDATE_ACCOUNT_MUTATION = `
  mutation UpdateAccount($input: UpdateAccount) {
    updateAccount(input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = `
  mutation UpdateAddressById($input: AddressInput) {
    updateAddressById(input: $input)
  }
`;

const USER_ADDRESSES_QUERY = `
  query UserAddresses {
    userAddresses {
      id
      label
      street
      city
      state
      postcode
      country
      setAsDefault
    }
  }
`;

const DELETE_ADDRESS_MUTATION = `
  mutation DeleteAddress($id: ID) {
    deleteAddress(id: $id)
  }
`;

describe("user smoke suite", () => {
  it("lists all users as an admin", async () => {
    const admin = await logInAsAdmin();
    await registerCustomer({
      firstName: "Member",
      lastName: "Two",
      email: "member.two@example.com",
    });

    const response = await graphQL({
      query: USERS_QUERY,
      token: admin.accessToken,
    });

    expectNoErrors(response);
    const users = response.body.data.users;
    expect(users.length).toBe(2);
    const emails = users.map((user: { email: string }) => user.email);
    expect(emails).toContain(process.env.ADMIN_EMAIL);
    expect(emails).toContain("member.two@example.com");
  });

  it("rejects a non admin users request", async () => {
    const customer = await registerAndLogin({ email: "plain.user@example.com" });

    const response = await graphQL({
      query: USERS_QUERY,
      token: customer.accessToken,
    });

    expect(getErrorCode(response)).toBe("WRONG_USER_TYPE");
  });

  it("fetches a single user as an admin", async () => {
    const admin = await logInAsAdmin();

    const response = await graphQL({
      query: USER_QUERY,
      variables: { id: admin.userId },
      token: admin.accessToken,
    });

    expectNoErrors(response);
    expect(response.body.data.user.id).toBe(admin.userId);
    expect(response.body.data.user.email).toBe(process.env.ADMIN_EMAIL);
  });

  it("returns USER_NOT_FOUND for an unknown user id", async () => {
    const admin = await logInAsAdmin();

    const response = await graphQL({
      query: USER_QUERY,
      variables: { id: "64b000000000000000000000" },
      token: admin.accessToken,
    });

    expect(getErrorCode(response)).toBe("USER_NOT_FOUND");
  });

  it("updates the admin account through updateAccount", async () => {
    const admin = await logInAsAdmin();

    const response = await graphQL({
      query: UPDATE_ACCOUNT_MUTATION,
      variables: {
        input: {
          firstName: "Updated",
          lastName: "Admin",
          email: "admin.updated@example.com",
        },
      },
      token: admin.accessToken,
    });

    expectNoErrors(response);
    expect(response.body.data.updateAccount.firstName).toBe("Updated");
    expect(response.body.data.updateAccount.email).toBe("admin.updated@example.com");
  });

  it("adds, lists, and deletes a customer address", async () => {
    const customer = await registerAndLogin({ email: "address.owner@example.com" });

    const addResponse = await graphQL({
      query: UPDATE_ADDRESS_MUTATION,
      variables: {
        input: {
          label: "home",
          street: "1 Test Street",
          city: "Sydney",
          state: "NSW",
          postcode: "2000",
          country: "AU",
          setAsDefault: true,
        },
      },
      token: customer.accessToken,
    });

    expectNoErrors(addResponse);
    expect(addResponse.body.data.updateAddressById).toBe(true);

    const listResponse = await graphQL({
      query: USER_ADDRESSES_QUERY,
      token: customer.accessToken,
    });

    expectNoErrors(listResponse);
    const addresses = listResponse.body.data.userAddresses;
    expect(addresses.length).toBe(1);
    expect(addresses[0].street).toBe("1 Test Street");
    expect(addresses[0].setAsDefault).toBe(true);
    const addressId = addresses[0].id;
    expect(addressId).toBeTruthy();

    const deleteResponse = await graphQL({
      query: DELETE_ADDRESS_MUTATION,
      variables: { id: addressId },
      token: customer.accessToken,
    });

    expectNoErrors(deleteResponse);
    expect(deleteResponse.body.data.deleteAddress).toBe(true);

    const afterDelete = await graphQL({
      query: USER_ADDRESSES_QUERY,
      token: customer.accessToken,
    });

    expect(afterDelete.body.data.userAddresses.length).toBe(0);
  });

  it("requires authentication for userAddresses", async () => {
    const response = await graphQL({ query: USER_ADDRESSES_QUERY });

    expect(getErrorCode(response)).toBe("NOT_AUTHENTICATED");
  });
});
