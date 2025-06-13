import { config } from "dotenv"
config()

import express from "express";
import cors from "cors";


const PORT = process.env.PORT || 8080;
const app = express()

app.use(cors({
    origin: "*"
}))


app.use(express.json())

app.use('/api/v1/test', (_, res) => {
    res.json({
        message: "Server is running",
	data: null,
	error: null
    });
    return;
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
