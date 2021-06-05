const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    proxy(
      [
        "/drive/api",
        "/sheet/api",
        "/sheet/student",
        "/aws/api",
        "/sheet/class",
        "/drive/email",
      ],
      { target: "http://localhost:8000" }
    )
  );
};
