describe("Guest routes", () => {
  it("loads the train entry screen", () => {
    cy.visit("/portal/train");
    cy.contains("Train");
  });

  it("loads the train log entry without auth", () => {
    cy.visit("/portal/train/log");
    cy.get("body").then(($body) => {
      const text = $body.text();
      expect(
        text.includes("No active program") ||
          text.includes("Ready to train") ||
          text.includes("Rest day") ||
          text.includes("Loading") ||
          text.includes("Guest mode") ||
          text.includes("Start Workout") ||
          text.includes("Sync & back up"),
      ).to.equal(true);
    });
  });
});
