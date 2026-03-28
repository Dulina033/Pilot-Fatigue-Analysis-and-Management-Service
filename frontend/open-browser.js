const open = require("open");

(async () => {
  // Wait 2 seconds so Vite has time to start
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // Open the Vite dev server URL in the default browser
  await open("http://localhost:5173");
})();
