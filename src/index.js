import express from 'express'
import "dotenv/config"
import cors from 'cors'
import job from './lib/cron.js'

import authRoutes from "./routes/authRoute.js"
import bookRoutes from "./routes/bookRoute.js"
import { connectDB } from './lib/db.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(cors())

job.start()
app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}.`)
    connectDB()
})