export default {
  async fetch(request, env) {
    // Serve static frontend assets from dist (SPA mode handles routing)
    return env.ASSETS.fetch(request);
  },
};
