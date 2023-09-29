// var express = require('express')
import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('./assets/server'));
app.use('/scripts', express.static('./mjs'));

app.listen(port);

console.log(`Server listening on http://localhost:${ port }`);