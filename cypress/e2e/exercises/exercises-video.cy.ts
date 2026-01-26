const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Exercises video", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("shows a video section when available", () => {
    cy.login();
    cy.visit("/portal/exercises");
    cy.get("[data-testid='exercise-card']").first().click();
    cy.get("[data-testid='exercise-detail-modal']").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find("[data-testid='exercise-video-section']").length > 0) {
        cy.get("[data-testid='exercise-video-section']")
          .find("iframe")
          .should("have.attr", "src")
          .and("include", "youtube.com");
      } else {
        cy.log("No video section available for this exercise.");
      }
    });
  });
});
