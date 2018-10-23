// Making sure we have all the necessary requirements for our code
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
var gameBoard = require('./public_html/makeBoard') // Requiring the makeboard file

const ROOT = "./public_html"; // our root

var players = {}; // global object of the users in the game

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server is active and listening on port 2406');

function handleRequest(req, res) {
	
	console.log(req.method+" request for: "+req.url);
	
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;

	if (urlObj.pathname === "/memory/intro"){ // Handling the /memory/into pathname
		
		if (players[urlObj.query.username]){ // If they user already exists in players, then we serve them a new game with a higher difficulty

			var level = [urlObj.query.currentLevel];
			var currentLevel = parseInt(level);

			var game = {board: gameBoard.makeBoard((currentLevel + 1) * 2)};
			game.difficulty = currentLevel;

			players[urlObj.query.username] = game; 

			respond(200, JSON.stringify({difficultyLevel: ((game.difficulty + 1) * 2)}))
		}
		else{ // We serve the new user a new game

			var level = [urlObj.query.currentLevel];
			var currentLevel = parseInt(level);

			var game = {board: gameBoard.makeBoard((currentLevel + 1) * 2)};
			game.difficulty = 1;

			players[urlObj.query.username] = game; 

			respond(200, JSON.stringify({difficultyLevel: ((game.difficulty + 1) * 2)}))
		}

	}
	else if(urlObj.pathname === "/memory/card"){ // Handling the /memory/card pathname

		var game = players[urlObj.query.username];

		var cardNumber = game.board[urlObj.query.row][urlObj.query.column];
		
		players[urlObj.query.username] = game; 

		respond(200, JSON.stringify(cardNumber));

	}
	else{ // If anything else is entered
	
		fs.stat(filename,function(err, stats){
			
			if(err){
				
				respondErr(err);
			}
			else{
				
				if(stats.isDirectory())	filename+="/index.html";
		
				fs.readFile(filename,"utf8",function(err, data){
					
					if(err)respondErr(err);
					else respond(200,data);
				});
			}
		});
	}			
	
	function serve404(){ // Helper function
		
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){
			
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
		
	function respondErr(err){ // Helper function
		
		console.log("Handling error: ",err);
		
		if(err.code==="ENOENT"){
			
			serve404();
		}
		else{
			
			respond(500,err.message);
		}
	}
		
	function respond(code, data){ // Helper function
		
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		res.end(data);
	}	
	
};