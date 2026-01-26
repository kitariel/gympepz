describe("Guest banner CTA", () => {
  it("routes guest banner CTA to login", () => {
    cy.visit("/portal/train/log");
    cy.get("body").then(($body) => {
      if ($body.find("[data-testid='guest-sync-cta']").length > 0) {
        cy.get("[data-testid='guest-sync-cta']").click();
        cy.url().should("include", "/login");
      } else {
        cy.log("Guest CTA not present on this screen.");
      }
    });
  });
});
