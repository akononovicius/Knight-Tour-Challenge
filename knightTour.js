var knightTour=function(){};
// internal variables
knightTour.prototype.sizeX=450;//preferred width of the game board in px
knightTour.prototype.sizeY=450;//preferred height of the game board in px
knightTour.prototype.rankX=8;//rank of the board on the x-axis
knightTour.prototype.rankY=8;//rank of the board on the y-axis
knightTour.prototype.fieldArr=[];//the board itself
knightTour.prototype.curId=0;//number of the last move made
knightTour.prototype.allowedSquares=0;//number of squares allowed to move into after last move
knightTour.prototype.lastPos=[];//coordinates of last move
knightTour.prototype.wantsAutoMove=true;//use auto move?
knightTour.prototype.figureMoves=[2,1];//movement shape of the piece used (knight - (2,1))
// gameboard interface
knightTour.prototype.gameBoardId="game-board";//id of div designated to be gameboard
knightTour.prototype.gameBoardRowClass="row";//css class for gameboard rows
knightTour.prototype.gameBoardColumnClass="col";//css class for gameboard rows
// square styles interfaces
knightTour.prototype.squareClass="cell";//css class for all squares
knightTour.prototype.allowedSquareClass="allowed";//css class for allowed squares
knightTour.prototype.autoMoveSquareClass="automoved";//css class for automoved
knightTour.prototype.currentSquareClass="current";//css class for current square
// messaging interface
knightTour.prototype.messageInterfaceId="log";//id of div containing messages
knightTour.prototype.clearMessageInterface=function() {$("#"+this.messageInterfaceId).text("").css("display","none");}
knightTour.prototype.prepareMessageInterface=function() {$("#"+this.messageInterfaceId).css("display","block");}
knightTour.prototype.appendToMessageInterface=function(t) {$("#"+this.messageInterfaceId).append("<p>"+t+"</p>");}
// functions
knightTour.prototype.initialize=function () {
	this.clearMessageInterface();
	this.curId=0;
	this.allowedSquares=0;
	this.fieldArr=[];
	var jqObj=$("#"+this.gameBoardId);
	jqObj.text("");
	for(var yi=0;yi<this.rankY;yi++) {
		var tstr="<div class=\""+this.gameBoardRowClass+" "+this.gameBoardRowClass+yi+"\">";
		var tfarr=[];
		for(var xi=0;xi<this.rankX;xi++) {
			var tid="c"+yi+"x"+xi;
			tstr+="<div id=\""+tid+"\" class=\""+this.squareClass+" "+this.gameBoardRowClass+yi+" "+this.gameBoardColumnClass+xi+"\"></div>";
			tfarr.push(0);
		}
		this.fieldArr.push(tfarr);
		jqObj.append(tstr+"</div>");
		for(var xi=0;xi<this.rankX;xi++) {
			var tid="c"+yi+"x"+xi;
			var gameObject=this;
			$("#"+tid).click(function (event) {return gameObject.onSquareClick(event.target.id);});
		}
	}
	var d=parseInt(Math.min(Math.floor(this.sizeY/this.rankY),Math.floor(this.sizeX/this.rankX)));
	$("#"+this.gameBoardId+" ."+this.squareClass).css("width",d+"px").css("height",d+"px").css("font-size",Math.floor(d*this.fontFraction())+"px");
	this.highLightSquares();
}
knightTour.prototype.fontFraction=function() {
	var full=this.rankX*this.rankY;
	if(full<10) return 0.75;
	else if(full<100) return 0.6;
	else return 0.45;
}
knightTour.prototype.isAllowed=function(x,y) {return this.isSquareVal(x,y,0);}
knightTour.prototype.allowSquare=function(x,y) {
	this.setSquareValue(x,y,0);
	this.allowedSquares++;
}
knightTour.prototype.isEmpty=function(x,y) {return this.isSquareVal(x,y,-1);}
knightTour.prototype.emptySquare=function(x,y) {this.setSquareValue(x,y,-1);this.setSquareText(x,y,"");}
knightTour.prototype.isSquareVal=function(x,y,v) {return (this.fieldArr[y][x]==v);}
knightTour.prototype.setSquareValue=function(x,y,v) {this.fieldArr[y][x]=v;}
knightTour.prototype.makeMoveTo=function(x,y) {
	this.curId++;
	this.lastPos=[x,y];
	this.setSquareValue(x,y,this.curId);
	this.setSquareText(x,y,this.curId);
	this.removeClass(this.currentSquareClass);
	this.addSquareClass(x,y,this.currentSquareClass);
	this.applyMovePattern(x,y);
}
knightTour.prototype.undo=function() {
	this.clearMessageInterface();
	if(this.curId==1) {
		this.initialize();
		return ;
	}
	var tmpAMove=this.wantsAutoMove;
	this.wantsAutoMove=false;
	var movePattern=this.obtainMovePattern(this.lastPos[0],this.lastPos[1]);
	this.curId--;
	this.removeClass(this.currentSquareClass);
	this.emptySquare(this.lastPos[0],this.lastPos[1]);
	var undoSquare=false;
	for(var i=0;i<movePattern.length && undoSquare===false;i++) {
		if(this.isSquareVal(movePattern[i][0],movePattern[i][1],this.curId)) undoSquare=movePattern[i];
	}
	this.lastPos=undoSquare;
	this.addSquareClass(undoSquare[0],undoSquare[1],this.currentSquareClass);
	this.applyMovePattern(undoSquare[0],undoSquare[1]);
	this.highLightSquares();
	this.wantsAutoMove=tmpAMove;
}
knightTour.prototype.obtainMovePattern=function(x,y) {
	var rez=[];
	for(var dirs=0;dirs<8;dirs++) {
		var trez=this.obtainSingleMove(x,y,dirs);
		if(!(trez===false)) rez.push(trez);
	}
	return rez;
}
knightTour.prototype.obtainSingleMove=function(x,y,d) {
	//right-most bit determines how many squares are moved
	// on x and y coordinates
	var moves=[this.figureMoves[0],this.figureMoves[1]];
	if(d % 2==0) moves=[moves[1],moves[0]];
	//second right-most bit determines if y coordinate is
	// increased or decreased
	d=d >> 1;
	if(d % 2==0) moves[1]*=(-1);
	//third right-most bit determines if x coordinate is
	// increased or decreased
	d=d >> 1;
	if(d % 2==0) moves[0]*=(-1);
	moves[0]+=x;
	moves[1]+=y;
	//returns false if move leads outside the board
	if(moves[0]<0 || this.rankX<=moves[0]) return false;
	if(moves[1]<0 || this.rankY<=moves[1]) return false;
	//returns coordinates otherwise
	return moves;
}
knightTour.prototype.applyMovePattern=function(x,y) {
	// forbid all possible
	for(var yi=0;yi<this.rankY;yi++) {
		for(var xi=0;xi<this.rankX;xi++) {
			if(this.isAllowed(xi,yi)) this.emptySquare(xi,yi);
		}
	}
	// allow based on pattern
	this.allowedSquares=0;
	var movePattern=this.obtainMovePattern(x,y);
	for(var i=0;i<movePattern.length;i++) {
		if(this.isEmpty(movePattern[i][0],movePattern[i][1])) this.allowSquare(movePattern[i][0],movePattern[i][1]);
	}
	// if no squares allowed
	if(this.allowedSquares==0) this.gameOver();
	// if automove possible
	else if(this.allowedSquares==1) this.autoMove();
}
knightTour.prototype.autoMove=function() {
	if(!this.wantsAutoMove) return ;
	var moveMade=false;
	for(var yi=0;yi<this.rankY && !moveMade;yi++) {
		for(var xi=0;xi<this.rankX && !moveMade;xi++) {
			if(this.isAllowed(xi,yi)) {
				this.makeMoveTo(xi,yi);
				this.addSquareClass(xi,yi,this.autoMoveSquareClass);
				moveMade=true;
			}
		}
	}
}
knightTour.prototype.addSquareClass=function(x,y,c) {
	$(this.getSquareId(x,y)).addClass(c);
}
knightTour.prototype.removeClass=function(c) {
	$("#"+this.gameBoardId+" ."+c).removeClass(c);
}
knightTour.prototype.setSquareText=function(x,y,t) {
	$(this.getSquareId(x,y)).text(t);
}
knightTour.prototype.getSquareId=function(x,y) {
	return "#c"+y+"x"+x;
}
knightTour.prototype.onSquareClick=function(id) {
	this.removeClass(this.autoMoveSquareClass);
	var coords=id.substr(1);
	coords=coords.split("x");
	coords[0]=parseInt(coords[0]);//y
	coords[1]=parseInt(coords[1]);//x
	if(this.isAllowed(coords[1],coords[0])) {
		this.makeMoveTo(coords[1],coords[0]);
		this.highLightSquares();
	} else if(this.lastPos[0]==coords[1] && this.lastPos[1]==coords[0]) {
		this.undo();
	}
	return false;
}
knightTour.prototype.highLightSquares=function() {
	this.removeClass(this.allowedSquareClass);
	for(var yi=0;yi<this.rankY;yi++) {
		for(var xi=0;xi<this.rankX;xi++) {
			if(this.isAllowed(xi,yi)) this.addSquareClass(xi,yi,this.allowedSquareClass);
		}
	}
}
knightTour.prototype.isClosedTour=function() {
	if(this.curId==this.rankX*this.rankY) {
		var x=this.lastPos[0];
		var y=this.lastPos[1];
		// check based on pattern
		var movePattern=this.obtainMovePattern(x,y);
		for(var i=0;i<movePattern.length;i++) {
			if(this.isSquareVal(movePattern[i][0],movePattern[i][1],1)) return true;
		}
	}
	return false;
}
knightTour.prototype.gameOver=function() {
	this.prepareMessageInterface();
	if(this.curId==this.rankX*this.rankY) this.appendToMessageInterface("Game over! You managed to fill whole "+this.rankX+"x"+this.rankY+" board.")
	else this.appendToMessageInterface("Game over! You managed to visit "+this.curId+" squares (out of "+(this.rankX*this.rankY)+" possible) on "+this.rankX+"x"+this.rankY+" board.")
	if(this.isClosedTour()) this.appendToMessageInterface("Congratulations! Your tour is a closed tour.");
	this.appendToMessageInterface("Press \"Set board size to:\" button to start a new game.");
}
