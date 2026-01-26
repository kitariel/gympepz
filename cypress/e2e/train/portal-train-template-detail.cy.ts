const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train template details", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("opens a template detail page", () => {
    cy.login();
    cy.visit("/portal/train/templates");
    cy.get("[data-testid='template-view-link']").first().click();
    cy.url().should("include", "/portal/train/template/");
  });
});
