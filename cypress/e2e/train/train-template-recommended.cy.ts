const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train templates recommended badge", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("shows recommended badge when available", () => {
    cy.login();
    cy.visit("/portal/train/templates");

    cy.get("body").then(($body) => {
      if ($body.find("[data-testid='template-recommended']").length > 0) {
        cy.get("[data-testid='template-recommended']").should("be.visible");
      } else {
        cy.log("No recommended templates available.");
      }
    });
  });
});
