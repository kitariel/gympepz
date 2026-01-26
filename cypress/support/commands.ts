declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", () => {
  const email = Cypress.env("TEST_EMAIL");
  const password = Cypress.env("TEST_PASSWORD");

  if (!email || !password) {
    throw new Error(
      "Missing Cypress auth env vars. Set CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD.",
    );
  }

  cy.visit("/login");
  cy.get("input#email").type(email);
  cy.contains("button", "Continue").click();
  cy.get("input#password", { timeout: 10000 }).type(password, {
    log: false,
  });
  cy.contains("button", "Sign in").click();
});

export {};
