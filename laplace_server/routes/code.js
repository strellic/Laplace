import express from "express";

import response from "../src/response.js";
import sandbox from "../src/sandbox.js";

const router = express.Router();

router.get("/langs", async (req, res) => {
    return res.json(response.success(sandbox.settings.langs));
});

export default router;