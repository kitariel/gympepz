const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train activity filters", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("toggles activity filters", () => {
    cy.login();
    cy.visit("/portal/train/activity");

    cy.get("[data-testid='activity-filter-all']").should(
      "have.attr",
      "aria-pressed",
      "true",
    );
    cy.get("[data-testid='activity-filter-pending']").click();
    cy.get("[data-testid='activity-filter-pending']").should(
      "have.attr",
      "aria-pressed",
      "true",
    );
    cy.get("[data-testid='activity-filter-synced']").click();
    cy.get("[data-testid='activity-filter-synced']").should(
      "have.attr",
      "aria-pressed",
      "true",
    );
  });
});
