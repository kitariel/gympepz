describe("Login validation", () => {
  it("requires an email before continuing", () => {
    cy.visit("/login");
    cy.contains("button", "Continue").should("be.disabled");
    cy.get("input#email").type("test@example.com");
    cy.contains("button", "Continue").should("not.be.disabled");
  });
});
