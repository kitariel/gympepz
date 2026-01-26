describe("Auth session", () => {
  it("includes user id and allows protected tRPC calls", () => {
    cy.login();

    cy.request("/api/auth/session").then((sessionRes) => {
      expect(sessionRes.status).to.equal(200);
      expect(sessionRes.body?.user?.id).to.be.a("string").and.not.empty;

      const userId = sessionRes.body.user.id as string;
      const input = encodeURIComponent(
        JSON.stringify({ 0: { json: { userId } } }),
      );

      cy.request(`/api/trpc/goal.getAll?batch=1&input=${input}`).then(
        (trpcRes) => {
          expect(trpcRes.status).to.equal(200);
          const payload = Array.isArray(trpcRes.body)
            ? trpcRes.body[0]
            : trpcRes.body;
          expect(payload).to.have.property("result");
          expect(payload.result).to.have.property("data");
        },
      );
    });
  });
});
