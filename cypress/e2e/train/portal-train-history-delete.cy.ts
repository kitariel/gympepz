const hasAuth =
  Boolean(Cypress.env("TEST_EMAIL")) && Boolean(Cypress.env("TEST_PASSWORD"));

describe("Train history delete", () => {
  const itIf = hasAuth ? it : it.skip;

  itIf("swipes to delete a history item when available", () => {
    cy.login();
    cy.visit("/portal/train/history");

    cy.get("body").then(($body) => {
      if ($body.find("[data-testid='history-item']").length === 0) {
        cy.log("No history items to delete.");
        return;
      }

      cy.get("[data-testid='history-item']").first().then(($item) => {
        const rect = $item[0]?.getBoundingClientRect();
        if (!rect) return;
        const startX = rect.right - 10;
        const endX = rect.left + 10;
        const y = rect.top + rect.height / 2;

        cy.wrap($item)
          .trigger("mousedown", { clientX: startX, clientY: y, button: 0 })
          .trigger("mousemove", { clientX: endX, clientY: y, button: 0 })
          .trigger("mouseup", { force: true });
      });
    });
  });
});
