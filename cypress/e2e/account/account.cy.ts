describe("Account page", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/portal/account");
  });

  it("renders all account sections", () => {
    cy.contains("Profile");
    cy.contains("Account Details");
    cy.contains("Address");
    cy.contains("Security");
    cy.contains("Plan and Billing");
    cy.contains("Sync Workouts");
    cy.contains("Preferences");
    cy.contains("Danger Zone");
    cy.contains("Free Plan");
  });

  it("updates profile with validation and success toast", () => {
    cy.get("input#name").clear().type("Kitjr");
    cy.get("input#fitness-goal").clear().type("Build muscle");
    cy.get("button#experience-level").click();
    cy.contains("Beginner").click();
    cy.get("textarea#bio")
      .clear()
      .type("Focused on consistent training and recovery.");

    cy.contains("button", "Save changes").click();
    cy.contains("Profile updated");

    cy.get("input#name").clear().type("A".repeat(101));
    cy.contains("Name must be 100 characters or less.");
    cy.contains("button", "Save changes").should("be.disabled");
  });

  it("saves address details", () => {
    cy.get("input#country").clear().type("Philippines");
    cy.get("input#region").clear().type("Cebu City");
    cy.contains("button", "Save address").click();
  });

  it("validates password changes before submit", () => {
    cy.contains("button", "Change").click();
    cy.get("input#current-password").type("wrong-password");
    cy.get("input#new-password").type("short");
    cy.get("input#confirm-password").type("short");
    cy.contains("button", "Change Password").click();
    cy.contains("Password must be at least 8 characters long");

    cy.get("input#new-password").clear().type("longenough");
    cy.get("input#confirm-password").clear().type("mismatch");
    cy.contains("button", "Change Password").click();
    cy.contains("Passwords do not match");
  });

  it("shows sync and preferences states", () => {
    cy.contains("Sync Workouts");
    cy.contains("All workouts are synced").should("exist");

    cy.contains("Preferences");
    cy.contains("button", "Dark").click();
    cy.contains("dark");
  });

  it("opens danger zone confirmation dialog", () => {
    cy.contains("button", "Delete account").click();
    cy.contains("Delete account");
    cy.contains("This is not wired yet.");
    cy.contains("button", "Understood").click();
  });
});
