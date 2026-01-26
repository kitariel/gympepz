const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train logging inputs", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("fills reps and weight, then marks a set complete", () => {
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

      cy.get("[data-testid='set-reps']").first().clear().type("8");
      cy.get("[data-testid='set-weight']").first().clear().type("135");

      cy.get("button[aria-current='true']")
        .find("[data-testid='workout-list-count']")
        .invoke("text")
        .then((beforeText) => {
          cy.get("[data-testid='set-complete']").first().click({ force: true });
          cy.get("[data-testid='set-complete']")
            .first()
            .should("have.attr", "data-state", "checked");
          cy.get("button[aria-current='true']")
            .find("[data-testid='workout-list-count']")
            .invoke("text")
            .should((afterText) => {
              expect(afterText).to.not.equal(beforeText);
            });
        });
    });
  });
});
