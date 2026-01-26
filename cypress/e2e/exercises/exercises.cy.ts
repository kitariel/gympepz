const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Exercises", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("filters and opens exercise details", () => {
    cy.login();
    cy.visit("/portal/exercises");

    cy.contains("exercises for you");

    cy.get("[data-testid='exercise-search']").type("bench");
    cy.get("[data-testid='exercise-search-clear']").should("be.visible");

    cy.get("[data-testid='filter-muscle']").click();
    cy.contains("[data-radix-collection-item]", "Chest").click();

    cy.get("[data-testid='filters-clear']").should("be.visible").click();
    cy.get("[data-testid='exercise-search']").should("have.value", "");

    cy.get("[data-testid='exercise-card']").first().click();
    cy.get("[data-testid='exercise-detail-modal']").should("be.visible");
  });
});
