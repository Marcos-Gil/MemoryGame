/*
Name: Marcos Gil
Purpose: JavaScript file sourced in my server that contains my functions
*/

// Globals to keep track of the user, the current level of the game, and the width of the gameboard to calculate the win condition
var user;
var gameBoardWidth;
var currentLevel = 0;

$(document).ready(function(){ // When the document loads, this function will just and use jQuery to make a GET request to /memory/intro

	user = window.prompt("What is your name?", "Default Name");

	if (user === ""){ // If the user erases the default "Default Name" value above and enters a blank space, the name will be saved as default

		user = "default";
	}
	
	initGame();
	
});

/*
Name: initGame
Purpose: To send info to the server with the users name and the level of the game, then the success callback with create a board with this info
Out: user, currentLevel
*/
function initGame(){
	
	// make a global, send it to server, prase the URL and use that
	currentLevel = currentLevel + 1;

	// Using jQuery to make a GET request with the user name then creating a game on the server side and storing the user
	$.ajax({
  		method:"GET",
  		url:"/memory/intro",
  		data: {'username': user, 'currentLevel': currentLevel},
  		success: displayGame,
  		dataType:'json'
	});
};

/*
Name: displayGame
Purpose: Create the gameboard in the HTML
In: Data from the server response
*/
function displayGame(data){ // Function that runs if the above GET request is a success which will take that data and create divs and insert them into the gameboard

	gameBoardWidth = data.difficultyLevel; // Using the data from the server response to assign the gameboard width to a global which will later be used to calculate the win condition
	
	// Displaying the current difficulty to the user
	var currentDifficulty = (gameBoardWidth / 2) - 1;
	$("body").append("<h2 id = 'currentLevel'>The current difficulty level is: '"+ currentDifficulty +"'</h2>")

	$("#gameboard").empty(); // Emptying this HTML element

	for (var i = 0; i < data.difficultyLevel; i++){

		var row = $("<tr></tr>"); // Creating a table row

		for(var j = 0; j < data.difficultyLevel; j++){

			var div = $("<div class = 'unflippedTile' data-flipped = '"+ 0 +"' data-row = '"+i+"' data-column ='"+j+"'></div>"); // Creating a div with the data values of column,row, and if the card is flipped or not
			div.click(chooseTile); // Adding a click event listener to the div 
			row.append(div); // Appending the div to the row
		}	
		
		$("#gameboard").append(row); // Appending the row to the table with the gameboard ID
	}
}

/*
Name: chooseTile
Purpose: Make a get request when the click event listener added to div is activated
Out: Tuser, selectedTile.data('row'), selectedTile.data('column')
*/
function chooseTile(){

	var selectedTile = $(this);  // Using $(this) to know which tile was selected and assigning it to a variable

	// Using jQuery to make a GET request with the user, row, and column, then get the value for the card that matches those properties
	$.ajax({
		method: "GET",
		url: "/memory/card",
  		data: {'username':user, 'row':selectedTile.data('row'), 'column':selectedTile.data('column')},
		success: function(data){tileAction(data, selectedTile);},
		dataType: 'json'
	});
}

var cardActive = false; // Boolean for if there is a card currently flipped up on the board
var gameWon = false;// If the game is won
var attempts = 0; // Counter for the number of matching attempts the user has made
var previousValue; // The value of the last card that was flipped on the gameboard
var lastFlipped; // The last card that was flipped in the last iteration
var amountOfPairs = 0; // The amount of succesful matches the user has that will be used to check the win condition
var pairFlipped = false; // Boolean to check if two cards are currently flipped up, so that the user cannot proceed with the game until they flip back down

/*
Name: tileAction
Purpose: Main logic of the tiles and deciding whether the game is wono
In: data, tile
*/
function tileAction(data, tile){

	// If this is true, that means a game was previously played and one. This is then called to reset the values to their default values for a fresh game to start
	if (gameWon === true){
		
		cardActive = false;
		attempts = 0;
		previousValue = undefined;
		lastFlipped = undefined;
		amountOfPairs = 0;
		pairFlipped = false;
		gameWon = false;
	}

	// If this is true, that means the timeout has not yet completed so this prevents the user from flipping more cards
	if (pairFlipped === true){

		return;
	}

	// If there isn't a card initially flipped to check the next click with
	if (lastFlipped === undefined && tile.data('flipped') === 0){

		lastFlipped = tile;
		lastFlipped.attr("class", "flippedTile"); // Changing this tiles CSS to the flipped up CSS class
		lastFlipped.append("<span>"+ data +"</span>"); // Adding a span to the tile with the data value that should be in that tile
		lastFlipped.data('flipped', 1); // Changing this cards data of flipped to 1, meaning that it is currently flipped up
		cardActive = true;
		previousValue = data; // Storing the current data to previousValue so in the next iteration we can compare to this and see if it's equal
		return;
	}

	// If the current card that got clicked has a flipped value of 1, it ignores 
	if (tile.data('flipped') === 1){

		return;
	}

	// If there is a card currently flipped on the board, then we flip the selected one then check if they are equal or not
	if (cardActive === true){

		tile.attr("class", "flippedTile");
		tile.append("<span>"+ data +"</span>");
		tile.data('flipped', 1);
		pairFlipped = true;

		if (data === previousValue){ // If both the cards match

			attempts = attempts + 1;
			cardActive = false;
			previousValue = undefined;
			lastFlipped = undefined;
			amountOfPairs = amountOfPairs + 1;
			pairFlipped = false;

			if (amountOfPairs === ((gameBoardWidth * gameBoardWidth) / 2)){ // If our win condition is, we alert the user then initialize a new game
				
				gameWon = true; // Setting our boolean so we can reset our values when the next game intializes

				setTimeout(function(){
					alert("You have won! You needed "+ attempts +" match attempts!");
				}, 50);

				$("#currentLevel").html("<span></span>");
				
				setTimeout(function(){
					initGame();
				}, 750);
			}
		}
		else{
			
			setTimeout(function(){ // setTimeout used to show the user the cards for a brief period of time before they get flipped back
				tile.attr("class", "unflippedTile");
				tile.html("<span></span>");
				tile.data('flipped', 0);
				lastFlipped.attr("class", "unflippedTile");
				lastFlipped.html("<span></span>");
				lastFlipped.data('flipped', 0);
				attempts = attempts + 1;
				cardActive = false;
				previousValue = undefined;
				lastFlipped = undefined;
				pairFlipped = false;
			}, 400);
		}
	}
}
