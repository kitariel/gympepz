const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train templates navigation", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("navigates to templates from the train entry screen", () => {
    cy.login();
    cy.visit("/portal/train");
    cy.get("[data-testid='browse-templates']", { timeout: 20000 }).click();
    cy.contains("Workout Templates");
  });
});
