var express = require('express');
var app = express();

app.use('/views', express.static(__dirname + "/views"));
app.use('/js', express.static(__dirname + "/js"));
app.use('/css', express.static(__dirname + "/css"));
app.all('/*', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(80);
