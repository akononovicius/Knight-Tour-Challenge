Knight-Tour-Challenge
=====================

HTML and jQuery implementation of the famous graph theory problem - [Knight's Tour](http://en.wikipedia.org/wiki/Knight%27s_tour).

#How to play

In this "game" you have to produce the longest possible sequence of moves of a chess knight, while visiting squares on the board only once. This sequence is called "tour". If your tour visits every square, then you have acchieved a full tour. If you have acchieved a full tour and from your last position you could move to your initial square, then you have acchieved a full closed tour.

The program highlights currently occupied square in pale blue, while possible moves are shown using pale green color. Click on the currently occupied square undoes the move.

#File structure

* index.html - HTML GUI and minimalstic coupling to javascript engine
* knightTour.js - knightTour javascript engine

#Copyright

Created by [Aleksejus Kononovicius](http://kononovicius.lt). Licensed under [Creative Commons Attribution-NonCommercial license](http://creativecommons.org/licenses/by-nc/4.0/) terms.
