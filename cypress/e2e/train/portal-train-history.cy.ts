const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train history", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("loads history screen", () => {
    cy.login();
    cy.visit("/portal/train/history");

    cy.contains("History");
    cy.get("body").then(($body) => {
      const text = $body.text();
      expect(
        text.includes("No sessions yet") ||
          text.includes("Swipe left to delete"),
      ).to.equal(true);
    });
  });
});
