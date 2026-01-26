const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train overview day switching", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("switches days when overview is ready", () => {
    cy.login();
    cy.visit("/portal/train/overview");

    cy.get("body").then(($body) => {
      if ($body.text().includes("Select a template")) {
        cy.log("No active program.");
        return;
      }

      cy.get("[data-testid='overview-day']").first().click();
      cy.get("[data-testid='overview-day-auto']").click();
    });
  });
});
