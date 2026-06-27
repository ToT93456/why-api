import dotenv from "dotenv";

import { createServer } from "./app.js";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const app = createServer();

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
