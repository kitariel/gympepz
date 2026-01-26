const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("UI viewport smoke", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("renders key screens on mobile viewport", () => {
    cy.viewport("iphone-6");
    cy.login();
    cy.visit("/portal/train");
    cy.contains("Train");
    cy.visit("/portal/exercises");
    cy.contains("exercises for you");
  });
});
