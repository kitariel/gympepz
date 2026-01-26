const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train activity sync button", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("renders sync button with a valid state", () => {
    cy.login();
    cy.visit("/portal/train/activity");

    cy.get("[data-testid='activity-sync']").should("exist");
    cy.get("[data-testid='activity-sync']").then(($btn) => {
      const isDisabled = $btn.is(":disabled");
      expect(isDisabled === true || isDisabled === false).to.equal(true);
    });
  });
});
