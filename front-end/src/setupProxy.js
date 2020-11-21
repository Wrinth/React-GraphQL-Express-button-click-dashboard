const { createProxyMiddleware } = require("http-proxy-middleware");

console.log("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/graphql",
    createProxyMiddleware({
      target: "http://127.0.0.1:4000",
      secure: false,
      changeOrigin: true,
      //ws: true, // proxy websockets
      pathRewrite: {
        "^/graphql": "/graphql",
      },
    })
  );
};
