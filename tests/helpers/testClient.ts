import request from "supertest";
import type { Express } from "express";
import { createServer } from "../../api/app";
import { seedAdmin } from "./seed";

let appPromise: Promise<Express> | undefined;

export function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = createServer().then(({ app }) => app);
  }
  return appPromise;
}

export async function createAgent(): Promise<request.Agent> {
  const app = await getApp();
  return request.agent(app);
}

export interface GraphQLOptions {
  query: string;
  variables?: Record<string, unknown>;
  token?: string;
  cookie?: string;
  agent?: request.Agent;
}

export async function graphQL(options: GraphQLOptions): Promise<request.Response> {
  const app = await getApp();
  const requester = options.agent ?? request.agent(app);
  let req = requester.post("/graphql").send({
    query: options.query,
    variables: options.variables ?? {},
  });
  if (options.token) req = req.set("Authorization", `Bearer ${options.token}`);
  if (options.cookie) req = req.set("Cookie", options.cookie);
  return req;
}

export function getErrorCode(response: request.Response): string | undefined {
  const firstError = response.body?.errors?.[0];
  return firstError?.extensions?.code;
}

export function expectNoErrors(response: request.Response): void {
  if (response.body?.errors) {
    throw new Error(`Unexpected GraphQL errors: ${JSON.stringify(response.body.errors)}`);
  }
}

const REGISTER_USER_MUTATION = `
  mutation CreateUser($input: UserInput) {
    createUser(input: $input) {
      id
      email
      firstName
      lastName
      role
    }
  }
`;

const LOG_IN_USER_MUTATION = `
  mutation LogInUser($input: LogInInput!) {
    logInUser(input: $input) {
      accessToken
      isLoggedIn
      user {
        role
        id
      }
    }
  }
`;

const LOG_IN_ADMIN_MUTATION = `
  mutation LogInAdmin($input: LogInInput!) {
    logInAdmin(input: $input) {
      accessToken
      isLoggedIn
      user {
        role
        id
      }
    }
  }
`;

export interface AuthSession {
  accessToken: string;
  refreshCookie: string | undefined;
  userId: string;
  email: string;
}

function extractRefreshCookie(response: request.Response): string | undefined {
  const setCookies = response.headers["set-cookie"];
  const raw = Array.isArray(setCookies)
    ? setCookies.find((c) => c.startsWith("refresh_token="))
    : undefined;
  return raw ? raw.split(";")[0] : undefined;
}

export interface RegisterCustomerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export async function registerCustomer(input: RegisterCustomerInput = {}): Promise<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}> {
  const variables = {
    firstName: input.firstName ?? "Jane",
    lastName: input.lastName ?? "Doe",
    email: input.email ?? "jane.doe@example.com",
    password: input.password ?? "Password123!",
  };
  const response = await graphQL({
    query: REGISTER_USER_MUTATION,
    variables: { input: variables },
  });
  expectNoErrors(response);
  return response.body.data.createUser;
}

export async function logInAsCustomer(email: string, password: string): Promise<AuthSession> {
  const response = await graphQL({
    query: LOG_IN_USER_MUTATION,
    variables: { input: { email, password } },
  });
  expectNoErrors(response);
  const data = response.body.data.logInUser;
  return {
    accessToken: data.accessToken,
    refreshCookie: extractRefreshCookie(response),
    userId: data.user.id,
    email,
  };
}

export async function registerAndLogin(input: RegisterCustomerInput = {}): Promise<AuthSession> {
  const variables = {
    firstName: input.firstName ?? "Jane",
    lastName: input.lastName ?? "Doe",
    email: input.email ?? "jane.doe@example.com",
    password: input.password ?? "Password123!",
  };
  await registerCustomer(variables);
  return logInAsCustomer(variables.email, variables.password);
}

export async function logInAsAdmin(): Promise<AuthSession> {
  const admin = await seedAdmin();
  const response = await graphQL({
    query: LOG_IN_ADMIN_MUTATION,
    variables: {
      input: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      },
    },
  });
  expectNoErrors(response);
  const data = response.body.data.logInAdmin;
  return {
    accessToken: data.accessToken,
    refreshCookie: extractRefreshCookie(response),
    userId: admin.id,
    email: process.env.ADMIN_EMAIL as string,
  };
}
