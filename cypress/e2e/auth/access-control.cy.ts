describe("Access control", () => {
  it("prompts guests to login for exercises", () => {
    cy.visit("/portal/exercises");
    cy.contains("Exercise Library");
    cy.contains("Login to browse the full exercise library");
    cy.contains("Login to sync");
    cy.get("[data-testid='exercise-card']").should("not.exist");
  });
});
