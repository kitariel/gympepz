describe("Storage indicator", () => {
  it("renders on portal train and supports clear dialog", () => {
    cy.visit("/portal/train");
    cy.get("[data-testid='storage-indicator']").should("exist");
    cy.get("[data-testid='storage-clear']").click();
    cy.get("[data-testid='storage-clear-cancel']").click();
  });

  it("renders on train", () => {
    cy.visit("/train");
    cy.get("[data-testid='storage-indicator']").should("exist");
  });
});
