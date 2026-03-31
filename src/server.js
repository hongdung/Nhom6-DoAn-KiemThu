const app = require("./app");

const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "localhost" : host;
  console.log(`D&M Fashion & Apparel is running at http://${displayHost}:${port}`);
});
