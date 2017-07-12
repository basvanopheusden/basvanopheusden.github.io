var is_paused = 1;
var game_data;
timer = null;

function keypress_handler(e){
	if(e.keyCode == 32){
		btn_press_play()
	}
	if(e.keyCode == 37){
		btn_press_backward()
	}
	if(e.keyCode == 39){
		btn_press_forward()
	}
}

function load_game_data(){
	var filename = "https://basvanopheusden.github.io/data/games.json"
	$.getJSON(filename, function(response) {
		game_data = response
		$(document).on('keydown', function(e){keypress_handler(e)});
		load_state()
	});
}

function show_game_info(){
	var color = game_data[player][gi][mi][0]
	var blackplayer,whiteplayer;
	if(color == 0){
		blackplayer = player;
	}
	else {
		
	}	
	$('.headertext').text("White: " + (player+1).toString() + 
	", Game " + (gi+1).toString() + ", Move " + (mi+1).toString())
}

function btn_press_play() {
    if(!is_paused){
      is_paused = 1;
	  $("#button_play i").attr("class", "fa fa-play");
	  $("#button_play").css("background-color", "#dddddd");
	  clearTimeout(timer);
	}
	else {
	  is_paused = 0;
	  $("#button_play i").attr("class", "fa fa-pause");
	  timer = setTimeout(btn_press_forward,2000);
	  $("#button_play").css("background-color", "#19DD89");
	}
}

function load_state(){
	var data = game_data[player][gi][mi]
	var color = data[0]
	var bp = data[1]
	var wp = data[2]
	var move = data[3]
	board = new Board()
	board.create_tiles()
	for(var i=0; i<M*N; i++){
		if(bp[i]=='1'){
			board.add_piece(i, 0);
		}
		if(wp[i]=='1'){
			board.add_piece(i, 1);
		}
	}
	board.add_piece(move,color);
	board.show_last_move(move, color);
	if(mi>0){
		data = game_data[player][gi][mi-1]
		color = data[0]
		move = data[3]
		board.show_last_move(move, color);
	}
	show_game_info()
}

function btn_press_forward() {
	mi++
	if(mi==game_data[player][gi].length){
		mi = 0
		gi++
		if(gi == game_data[player].length){
			gi = 0
			player++
		}
		load_state()
	}
	else {
		var data = game_data[player][gi][mi]
		var color = data[0]
		var move = data[3]
		board.add_piece(move,color);
		board.show_last_move(move, color);
	}
	clearTimeout(timer);
	if(!is_paused){
		timer = setTimeout(btn_press_forward,2000);
	}
	show_game_info()
}

function btn_press_backward(){
	if(mi == 0){
		if(gi == 0){
			if(player != 0){
				player--				
			}
			gi = game_data[player].length - 1
		}
		else {
			gi--
		}
		mi = game_data[player][gi].length - 1
		load_state()
	}
	else {
		board.tiles[game_data[player][gi][mi][3]].empty().removeClass("usedTile").addClass("tile").off('mouseenter').off('mouseleave').css("backgroundColor", square_bkgcolor);
		mi--
		if(mi > 0){
			var data = game_data[player][gi][mi-1]
			var color = data[0]
			var move = data[3]
			board.show_last_move(move, color);
		}
	}
	clearTimeout(timer);
	if(!is_paused){
		timer = setTimeout(btn_press_forward,2000);
	}
	show_game_info()
}


function load_game_data_old(){
	var filename = "https://basvanopheusden.github.io/data/games.csv"
	$.get(filename, function(response) {
		game_data = response.split("\n");
		make_json();
	});
}

function make_json(){
	player = 0;
	x=[]
	y=[]
	z=[]
	for(var i=0;i<game_data.length-1;i++){
		var p = game_data[i].split(",")[0]
		var wp = game_data[i].split(",")[3]
		var bp = game_data[i].split(",")[2]
		var color = parseInt(game_data[i].split(",")[1])
		var move = parseInt(game_data[i].split(",")[4])
		var l = bp.split('1').length + wp.split('1').length -2
		if(p > player && p < 1000){
			player++
			x.push(y)
			y=[]
		}
		if(l == 0 && i>0){
			y.push(z)
			z=[]
		}
		z.push([color,bp,wp,move,p])
	}
	x.push(y)
	console.log(x.length)
    var blob = new Blob([JSON.stringify(x)], {type: 'text/json'});
	var elem = window.document.createElement('a');
	elem.href = window.URL.createObjectURL(blob);
	elem.download = "games.json";        
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
}