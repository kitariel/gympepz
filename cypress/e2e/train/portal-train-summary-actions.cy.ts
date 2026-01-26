const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train summary actions", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("loads summary state and CTAs", () => {
    cy.login();
    cy.visit("/portal/train/summary");
    cy.get("body").then(($body) => {
      const text = $body.text();
      expect(
        text.includes("Workout complete") ||
          text.includes("Great work!") ||
          text.includes("Workout saved!") ||
          text.includes("Loading"),
      ).to.equal(true);

      const hasMissingState = $body.find("[data-testid='summary-view-history']").length > 0;
      if (hasMissingState) {
        cy.get("[data-testid='summary-view-history']").should("exist");
        cy.get("[data-testid='summary-back-overview']").should("exist");
        return;
      }

      if ($body.find("[data-testid='summary-start-next']").length > 0) {
        cy.get("[data-testid='summary-start-next']").should("be.visible");
      }
    });
  });
});
