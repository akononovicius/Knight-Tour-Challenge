var knightTour=function(){};
// internal variables
knightTour.prototype.sizeX=450;//preferred width of the game board in px
knightTour.prototype.sizeY=450;//preferred height of the game board in px
knightTour.prototype.rankX=8;//rank of the board on the x-axis
knightTour.prototype.rankY=8;//rank of the board on the y-axis
knightTour.prototype.fieldArr=[];//the board itself
knightTour.prototype.curId=0;//number of the last move made
knightTour.prototype.allowedCells=0;//number of cells allowed to move into after last move
knightTour.prototype.lastPos=[];//coordinates of last move
knightTour.prototype.wantsAutoMove=true;//use auto move?
// gameboard interface
knightTour.prototype.gameBoardId="game-board";//id of div designated to be gameboard
knightTour.prototype.gameBoardRowClass="row";//css class for gameboard rows
knightTour.prototype.gameBoardColumnClass="col";//css class for gameboard rows
// cell styles interfaces
knightTour.prototype.cellClass="cell";//css class for all cells
knightTour.prototype.allowedCellClass="allowed";//css class for allowed cells
knightTour.prototype.autoMoveCellClass="automoved";//css class for automoved
knightTour.prototype.currentCellClass="current";//css class for current cell
// messaging interface
knightTour.prototype.messageInterfaceId="log";//id of div containing messages
knightTour.prototype.clearMessageInterface=function() {$("#"+this.messageInterfaceId).text("").css("display","none");}
knightTour.prototype.prepareMessageInterface=function() {$("#"+this.messageInterfaceId).css("display","block");}
knightTour.prototype.appendToMessageInterface=function(t) {$("#"+this.messageInterfaceId).append("<p>"+t+"</p>");}
// functions
knightTour.prototype.initialize=function () {
	this.clearMessageInterface();
	this.curId=0;
	this.allowedCells=0;
	this.fieldArr=[];
	var jqObj=$("#"+this.gameBoardId);
	jqObj.text("");
	for(var yi=0;yi<this.rankY;yi++) {
		var tstr="<div class=\""+this.gameBoardRowClass+" "+this.gameBoardRowClass+yi+"\">";
		var tfarr=[];
		for(var xi=0;xi<this.rankX;xi++) {
			var tid="c"+yi+"x"+xi;
			tstr+="<div id=\""+tid+"\" class=\""+this.cellClass+" "+this.gameBoardRowClass+yi+" "+this.gameBoardColumnClass+xi+"\"></div>";
			tfarr.push(0);
		}
		this.fieldArr.push(tfarr);
		jqObj.append(tstr+"</div>");
		for(var xi=0;xi<this.rankX;xi++) {
			var tid="c"+yi+"x"+xi;
			var gameObject=this;
			$("#"+tid).click(function (event) {return gameObject.onCellClick(event.target.id);});
		}
	}
	var d=parseInt(Math.min(Math.floor(this.sizeY/this.rankY),Math.floor(this.sizeX/this.rankX)));
	$("#"+this.gameBoardId+" ."+this.cellClass).css("width",d+"px").css("height",d+"px").css("font-size",Math.floor(d*this.fontFraction())+"px");
	this.highLightCells();
}
knightTour.prototype.fontFraction=function() {
	var full=this.rankX*this.rankY;
	if(full<10) return 0.75;
	else if(full<100) return 0.6;
	else return 0.45;
}
knightTour.prototype.isAllowed=function(x,y) {return this.isCellVal(x,y,0);}
knightTour.prototype.allowCell=function(x,y) {
	this.setCellValue(x,y,0);
	this.allowedCells++;
}
knightTour.prototype.isEmpty=function(x,y) {return this.isCellVal(x,y,-1);}
knightTour.prototype.emptyCell=function(x,y) {this.setCellValue(x,y,-1);this.setCellText(x,y,"");}
knightTour.prototype.isCellVal=function(x,y,v) {return (this.fieldArr[y][x]==v);}
knightTour.prototype.setCellValue=function(x,y,v) {this.fieldArr[y][x]=v;}
knightTour.prototype.makeMoveTo=function(x,y) {
	this.curId++;
	this.lastPos=[x,y];
	this.setCellValue(x,y,this.curId);
	this.setCellText(x,y,this.curId);
	this.removeClass(this.currentCellClass);
	this.addCellClass(x,y,this.currentCellClass);
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
	this.removeClass(this.currentCellClass);
	this.emptyCell(this.lastPos[0],this.lastPos[1]);
	var undoCell=false;
	for(var i=0;i<movePattern.length && undoCell===false;i++) {
		if(this.isCellVal(movePattern[i][0],movePattern[i][1],this.curId)) undoCell=movePattern[i];
	}
	this.lastPos=undoCell;
	this.addCellClass(undoCell[0],undoCell[1],this.currentCellClass);
	this.applyMovePattern(undoCell[0],undoCell[1]);
	this.highLightCells();
	this.wantsAutoMove=tmpAMove;
}
knightTour.prototype.obtainMovePattern=function(x,y) {
	var rez=[];
	//  left-forward
	if(1<x && 0<y) rez.push([x-2,y-1]);
	//  right-forward
	if(1<x && y<this.rankY-1) rez.push([x-2,y+1]);
	//  left-back
	if(x<this.rankX-2 && 0<y) rez.push([x+2,y-1]);
	//  right-back
	if(x<this.rankX-2 && y<this.rankY-1) rez.push([x+2,y+1]);
	//  forward-left
	if(0<x && 1<y) rez.push([x-1,y-2]);
	//  forward-right
	if(x<this.rankX-1 && 1<y) rez.push([x+1,y-2]);
	//  left-back
	if(0<x && y<this.rankY-2) rez.push([x-1,y+2]);
	//  right-back
	if(x<this.rankX-1 && y<this.rankY-2) rez.push([x+1,y+2]);
	return rez;
}
knightTour.prototype.applyMovePattern=function(x,y) {
	// forbid all possible
	for(var yi=0;yi<this.rankY;yi++) {
		for(var xi=0;xi<this.rankX;xi++) {
			if(this.isAllowed(xi,yi)) this.emptyCell(xi,yi);
		}
	}
	// allow based on pattern
	this.allowedCells=0;
	var movePattern=this.obtainMovePattern(x,y);
	for(var i=0;i<movePattern.length;i++) {
		if(this.isEmpty(movePattern[i][0],movePattern[i][1])) this.allowCell(movePattern[i][0],movePattern[i][1]);
	}
	// if no cells allowed
	if(this.allowedCells==0) this.gameOver();
	// if automove possible
	else if(this.allowedCells==1) this.autoMove();
}
knightTour.prototype.autoMove=function() {
	if(!this.wantsAutoMove) return ;
	var moveMade=false;
	for(var yi=0;yi<this.rankY && !moveMade;yi++) {
		for(var xi=0;xi<this.rankX && !moveMade;xi++) {
			if(this.isAllowed(xi,yi)) {
				this.makeMoveTo(xi,yi);
				this.addCellClass(xi,yi,this.autoMoveCellClass);
				moveMade=true;
			}
		}
	}
}
knightTour.prototype.addCellClass=function(x,y,c) {
	$(this.getCellId(x,y)).addClass(c);
}
knightTour.prototype.removeClass=function(c) {
	$("#"+this.gameBoardId+" ."+c).removeClass(c);
}
knightTour.prototype.setCellText=function(x,y,t) {
	$(this.getCellId(x,y)).text(t);
}
knightTour.prototype.getCellId=function(x,y) {
	return "#c"+y+"x"+x;
}
knightTour.prototype.onCellClick=function(id) {
	this.removeClass(this.autoMoveCellClass);
	var coords=id.substr(1);
	coords=coords.split("x");
	coords[0]=parseInt(coords[0]);//y
	coords[1]=parseInt(coords[1]);//x
	if(this.isAllowed(coords[1],coords[0])) {
		this.makeMoveTo(coords[1],coords[0]);
		this.highLightCells();
	} else if(this.lastPos[0]==coords[1] && this.lastPos[1]==coords[0]) {
		this.undo();
	}
	return false;
}
knightTour.prototype.highLightCells=function() {
	this.removeClass(this.allowedCellClass);
	for(var yi=0;yi<this.rankY;yi++) {
		for(var xi=0;xi<this.rankX;xi++) {
			if(this.isAllowed(xi,yi)) this.addCellClass(xi,yi,this.allowedCellClass);
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
			if(this.isCellVal(movePattern[i][0],movePattern[i][1],1)) return true;
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
