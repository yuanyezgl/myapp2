var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/read', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
		console. 	log(JSON.stringify(req.body));
		conn.query(
            'SELECT Name, delete__c, val__c FROM salesforce.myObject__c WHERE Lower(Name) = LOWER($1) AND delete__c = 0 OR Lower(Name) = LOWER($1) AND delete__c = 2',
            [req.body.name.trim()],
            function(err, result) {
                if (err) {
                    res.status(400).json({error: err.message});
                }
                else if (result.rowCount == 0) {
                    res.status(400).json({error: 'Cannot find this Object.'});
                }
                else {
                    res.json(result);
                }
            }
        );
    });

});

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
		console.log(JSON.stringify(req.body));
        conn.query(
			'UPDATE salesforce.myObject__c SET val__c = $2 WHERE Lower(Name) = LOWER($1) AND delete__c = 0 OR Lower(Name) = LOWER($1) AND delete__c = 2',
			[req.body.name.trim(),req.body.value],
			function(err, result){
				done();
				if (err) {
                    res.status(400).json({error: err.message});
                }
                else if (result.rowCount == 0) {
					
                    res.status(400).json({error: 'Cannot find this Object.'});
                }else{
					res.json(result);
				}
			}
		);
    });

});

app.post('/create', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
		console.log(JSON.stringify(req.body));
        conn.query(
			'SELECT name,delete__c  FROM salesforce.myObject__c WHERE Lower(Name) = LOWER($1) AND delete__c = 0 OR Lower(Name) = LOWER($1) AND delete__c = 2',
            [req.body.name.trim()],
			function(err, result){
				done();
				if (err) {
                    res.status(400).json({error: err.message});
                }else if (result.rowCount == 0){
					conn.query(
					'INSERT INTO salesforce.myObject__c (name, val__c, delete__c) VALUES (LOWER($1), $2,0)',
					[req.body.name.trim(),req.body.value],
					function(err, result){
						done();
						if (err) {
							res.status(400).json({error: err.message});
						}else{
							res.json(result);
						}
					});
				}else{
					res.status(400).json({error: "duplicate name"});
				}
			}
		);
    });

});

app.post('/del', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
		console.log(JSON.stringify(req.body));
        conn.query(
			'UPDATE salesforce.myObject__c SET delete__c = 1 WHERE Lower(Name) = LOWER($1) AND delete__c = 0 OR Lower(Name) = LOWER($1) AND delete__c = 2',
			[req.body.name.trim()],
			function(err, result){
				done();
				if (err) {
                    res.status(400).json({error: err.message});
				}else if (result.rowCount == 0) {
                    res.status(400).json({error: 'Cannot find this Object.'});
                }else{
					res.json(result);
				}
			}
		);
    });

});


app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
