const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train finish dialogs", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("shows the finish dialog variants and keeps logging", () => {
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

      cy.contains("Workout list", { timeout: 20000 });

      cy.get("[data-testid='finish-workout']").then(($btn) => {
        if ($btn.is(":disabled")) {
          cy.contains("button", "Add set").click();
          cy.get("[data-testid='set-complete']").first().click({ force: true });
        }
      });

      cy.get("[data-testid='finish-workout']").click();

      cy.get("body").then(($dialogBody) => {
        const dialogText = $dialogBody.text();

        if (dialogText.includes("No sets completed")) {
          cy.contains("button", "Keep logging").click();
          return;
        }

        if (dialogText.includes("Finish early?")) {
          cy.contains("button", "Keep going").click();
          return;
        }

        if (dialogText.includes("Great work!")) {
          cy.contains("button", "Add more sets").click();
        }
      });
    });
  });
});
