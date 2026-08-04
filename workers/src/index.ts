/**
 * Placeholder Worker entry point. No routes are implemented in M1 — this
 * exists so the deployment pipeline and folder structure are ready for the
 * first real edge Worker (see workers/README.md).
 */
const worker = {
  async fetch(): Promise<Response> {
    return new Response("Business AI Manager Worker — not yet implemented", {
      status: 501,
    });
  },
};

export default worker;
