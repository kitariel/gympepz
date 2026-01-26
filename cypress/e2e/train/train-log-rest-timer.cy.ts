const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train rest timer", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("starts and stops the rest timer", () => {
    cy.login();
    cy.visit("/portal/train/log");

    cy.get("body").then(($body) => {
      const text = $body.text();

      if (text.includes("No active program") || text.includes("Rest day")) {
        cy.log("Skipping: no active program or rest day.");
        return;
      }

      if (text.includes("Ready to train")) {
        cy.get("[data-testid='start-workout']").click();
      }

      cy.get("[data-testid='rest-timer-60']", { timeout: 20000 }).click();
      cy.get("[data-testid='rest-timer-active']").click();
      cy.get("[data-testid='rest-timer-60']").should("exist");
    });
  });
});
