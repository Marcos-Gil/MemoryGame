Author: Marcos Gil
Browser Used: Chrome
Operating System: Windows 10

Purpose of Program: 
-------------------

Create a memory game that simulates this 
https://en.wikipedia.org/wiki/Concentration_(game)


List of Sources:
----------------

app.js
404.html
gameLogic.js
index.html
makeBoard.js
style.css


Launching instructions:
-----------------------

1. Open terminal and traverse to folder where app.js is located
2. Type "node app.js" into the terminal
3. Now open your browser(preferably Chrome where this was tested).
4. Type in http://localhost:2406/ into the address bar and you will now be on the site

Gameplay:
---------

1. Select an unflipped card to have its value displayed
2. Select another unflipped card
3. If both values match, both cards will remain flipped up. Else, both cards will be flipped down and steps 1-3 will repeat
4. Once all tiles have been matched properly on the board, the user is prompted with a victory message and the number of match
   attempts it took them. After pressing ok on this alert, a new game is displayed for the user with increased difficulty
