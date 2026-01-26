const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train plans actions", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("shows plan actions or empty CTA", () => {
    cy.login();
    cy.visit("/portal/train/plans");

    cy.get("body").then(($body) => {
      if ($body.find("[data-testid='plans-create-first']").length > 0) {
        cy.get("[data-testid='plans-create-first']").should("exist");
        return;
      }

      cy.get("[data-testid='plans-create']").should("exist");
      cy.get("[data-testid='plans-use']").first().should("exist");
      cy.get("[data-testid='plans-edit']").first().should("exist");
      cy.get("[data-testid='plans-duplicate']").first().should("exist");
      cy.get("[data-testid='plans-delete']").first().should("exist");
    });
  });
});
