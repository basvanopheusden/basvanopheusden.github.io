var table = "generalization";
var blocks = [new Demo(60)];
var current_block = 0;

// Launch!

$(document).ready(function() {
	current_block = 0;
	$(".indicator").css("color","#FFFFFF");
	$(".scorebox").animate({backgroundColor:"#FFFFFF", 
		color:"#FFFFFF", 
		borderColor:"#FFFFFF"}, 0);
	board = new Board();
	board.create_tiles()
	$(".eval-element").css("opacity", 0);
	$('input[name="radio"]').off('click').attr('disabled', true).css("cursor", "none");
	
	player = new Player();
	player.initials = Date.now();
	track_mouse(player);
	blocks[current_block].run_block()
})
