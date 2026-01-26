const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train logging", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("starts or resumes a workout and finishes it", () => {
    cy.login();
    cy.visit("/portal/train/log");

    cy.get("body").then(($body) => {
      const text = $body.text();

      if (text.includes("No active program")) {
        cy.contains("Browse templates").should("exist");
        return;
      }

      if (text.includes("Rest day")) {
        cy.contains("View overview").should("exist");
        return;
      }

      if (text.includes("Ready to train")) {
        cy.get("[data-testid='start-workout']").click();
      }
    });

    cy.get("[data-testid='finish-workout']", { timeout: 20000 }).then(($btn) => {
      if ($btn.is(":disabled")) {
        cy.contains("button", "Add set").click();
      }
    });

    cy.get("[data-testid='set-complete']").first().click({ force: true });

    cy.get("[data-testid='finish-workout']").click();

    cy.get("body").then(($body) => {
      if ($body.text().includes("Finish workout")) {
        cy.contains("button", "Finish workout").click();
        return;
      }
      if ($body.text().includes("Finish anyway")) {
        cy.contains("button", "Finish anyway").click();
        return;
      }
    });
  });
});
