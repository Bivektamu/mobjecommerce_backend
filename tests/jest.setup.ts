// Dummy values so the suite never touches real secrets. The resolvers read
// these from process.env at use time, and Stripe's client is constructed at
// import time, so every consumer needs a placeholder.

process.env.JWT_ACCESS_TOKEN_SECRET = "test-access-token-secret";
process.env.JWT_REFRESH_TOKEN_SECRET = "test-refresh-token-secret";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = "TestAdminPass123!";
process.env.LOCAL_URI = "http://localhost:3000";
process.env.PROD_URI = "http://localhost:3001";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
