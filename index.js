const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");
const app = express()

const port = 3000

app.use(bodyParser.json());
app.use(express.json());
app.use(cors())

app.options('/', (req, res)=> {
    res.status(200).end()
})

app.get('/', (req, res) => {
  res.status(201).send('Hello World');
});

const ip = "127.0.0.1";
const server = http.createServer(app);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port);

module.exports = app