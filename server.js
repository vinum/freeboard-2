var express = require('express'),
    path = require('path'),
    app = express();

app.set('port', 3000);
app.use(express.static(path.join(__dirname, "")));

app.listen(app.get('port'), function () {
    console.log("Express server listening on port %s.", app.get('port'));
});
