import {
  expectNoErrors,
  getErrorCode,
  graphQL,
  logInAsAdmin,
  logInAsCustomer,
  registerAndLogin,
  registerCustomer,
} from "../helpers/testClient";

const GET_AUTH_STATUS_QUERY = `
  query GetAuthStatus {
    getAuthStatus {
      accessToken
      isLoggedIn
      user {
        role
        id
      }
    }
  }
`;

const LOG_OUT_MUTATION = `
  mutation LogOut {
    logOutUser {
      isLoggedIn
      user {
        role
        id
      }
    }
  }
`;

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken {
    refreshToken {
      accessToken
      isLoggedIn
      user {
        role
        id
      }
    }
  }
`;

const REGISTER_USER_MUTATION = `
  mutation CreateUser($input: UserInput) {
    createUser(input: $input) {
      id
      email
    }
  }
`;

describe("auth smoke suite", () => {
  it("registers a user and logs the user in over HTTP", async () => {
    const created = await registerCustomer({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada.lovelace@example.com",
    });
    expect(created.id).toBeTruthy();
    expect(created.email).toBe("ada.lovelace@example.com");
    expect(created.role).toBe("customer");

    const session = await logInAsCustomer("ada.lovelace@example.com", "Password123!");
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshCookie).toMatch(/^refresh_token=/);
    expect(session.userId).toBe(created.id);
  });

  it("rejects a duplicate email registration with ALREADY_EXISTS", async () => {
    const email = "duplicate@example.com";
    await registerCustomer({ email });

    const response = await graphQL({
      query: REGISTER_USER_MUTATION,
      variables: {
        input: { firstName: "Other", lastName: "User", email, password: "Password123!" },
      },
    });

    expect(getErrorCode(response)).toBe("ALREADY_EXISTS");
  });

  it("rejects login with wrong credentials", async () => {
    await registerCustomer({ email: "wrong.password@example.com" });

    const response = await graphQL({
      query: `
        mutation LogInUser($input: LogInInput!) {
          logInUser(input: $input) {
            accessToken
          }
        }
      `,
      variables: { input: { email: "wrong.password@example.com", password: "NotThePassword!" } },
    });

    expect(getErrorCode(response)).toBe("BAD_CREDENTIALS");
  });

  it("returns the auth status for an authenticated user", async () => {
    const session = await registerAndLogin({ email: "status.check@example.com" });

    const response = await graphQL({
      query: GET_AUTH_STATUS_QUERY,
      token: session.accessToken,
    });

    expectNoErrors(response);
    expect(response.body.data.getAuthStatus.isLoggedIn).toBe(true);
    expect(response.body.data.getAuthStatus.user.id).toBe(session.userId);
    expect(response.body.data.getAuthStatus.user.role).toBe("customer");
  });

  it("fails getAuthStatus with NOT_AUTHENTICATED for a guest", async () => {
    const response = await graphQL({ query: GET_AUTH_STATUS_QUERY });

    expect(getErrorCode(response)).toBe("NOT_AUTHENTICATED");
  });

  it("logs a user out", async () => {
    const session = await registerAndLogin({ email: "logout.me@example.com" });

    const response = await graphQL({
      query: LOG_OUT_MUTATION,
      token: session.accessToken,
    });

    expectNoErrors(response);
    expect(response.body.data.logOutUser.isLoggedIn).toBe(false);
  });

  it("issues a fresh access token from the refresh cookie", async () => {
    const session = await registerAndLogin({ email: "refresh.me@example.com" });
    expect(session.refreshCookie).toBeTruthy();
    const refreshCookie = session.refreshCookie as string;

    const response = await graphQL({
      query: REFRESH_TOKEN_MUTATION,
      cookie: refreshCookie,
    });

    expectNoErrors(response);
    expect(response.body.data.refreshToken.accessToken).toBeTruthy();
    expect(response.body.data.refreshToken.isLoggedIn).toBe(true);
  });

  it("fails refreshToken with JWT_TOKEN_MISSING when no cookie is sent", async () => {
    const response = await graphQL({ query: REFRESH_TOKEN_MUTATION });

    expect(getErrorCode(response)).toBe("JWT_TOKEN_MISSING");
  });

  it("logs an admin in through logInAdmin", async () => {
    const session = await logInAsAdmin();

    expect(session.accessToken).toBeTruthy();
    expect(session.email).toBe(process.env.ADMIN_EMAIL);

    const statusResponse = await graphQL({
      query: GET_AUTH_STATUS_QUERY,
      token: session.accessToken,
    });

    expectNoErrors(statusResponse);
    expect(statusResponse.body.data.getAuthStatus.user.role).toBe("admin");
    expect(statusResponse.body.data.getAuthStatus.user.id).toBe(session.userId);
  });
});
