const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Authenticated flows", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("logs in and shows the train entry screen", () => {
    cy.login();
    cy.url().should("include", "/portal/train");
    cy.contains("Train");
    cy.contains("Single view");
  });
});
