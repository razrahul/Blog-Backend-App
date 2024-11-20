import app from "./App.js"
import {connectDB} from "./config/database.js"

connectDB();


const Port = process.env.PORT;

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`)
})



