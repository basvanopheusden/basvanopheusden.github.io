var is_paused = 1;
var game_data = null;
timer = null;

function start(data){
	game_data = data
	$(document).off('keydown').on('keydown', function(e){keypress_handler(e)});
	player = 0 
	gi = 0 
	mi = -1
	load_state()
}

function select_random_board(){
	if(game_data != null){
		player = Math.floor((Math.random() * game_data.length));
		gi = Math.floor((Math.random() * game_data[player].length));
		mi = Math.floor((Math.random() * (game_data[player][gi].length+1)))-1;
		load_state()
	}
}

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

function load_game_data(filename){
	board = new Board();
	board.create_tiles();
	$.getJSON(filename, function(response) {
		start(response)
	});
}

function process_name(n){
	if(n >= 1000){
		return "Computer " + ((n-1000) % 30 +1).toString()
	}
	else {
		return "Participant " + (Math.floor(n/5)+1).toString()
	}
}

function get_session(n1,n2){
	return (Math.floor(Math.min(n1,n2)%5 + 1)).toString()
}

function show_game_info(){
	var color = (mi>=0 ? game_data[player][gi][mi][0] : 0)
	var blackplayer = process_name(game_data[player][gi][0][4])
	var whiteplayer = process_name(game_data[player][gi][1][4])
	$('.headertext').text("Black: " + blackplayer + ", White: " + whiteplayer + ", session " + 
	get_session(game_data[player][gi][0][4],game_data[player][gi][1][4]))
	$('.headertext2').text("Move " + (mi+2).toString() + ", " + ((color==0)?"White":"Black") + " to move")
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
	  $("#button_play").css("background-color", "#ffa500");
	}
}

function load_state(){
	board = new Board()
	board.create_tiles()
	if(mi>=0){
		var data = game_data[player][gi][mi]
		var color = data[0]
		var bp = data[1]
		var wp = data[2]
		var move = data[3]
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
		board.evaluate_win(color);
		if(mi>0){
			data = game_data[player][gi][mi-1]
			color = data[0]
			move = data[3]
			board.show_last_move(move, color);
		}
	}
	show_game_info()
}

function btn_press_forward() {
	if(mi<game_data[player][gi].length-1 || gi<game_data[player].length-1 || player<game_data.length-1){
		mi++
		if(mi==game_data[player][gi].length){
			mi = -1
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
			board.evaluate_win(color);
		}
		clearTimeout(timer);
		if(!is_paused){
			timer = setTimeout(btn_press_forward,2000);
		}
		show_game_info()
	}
}

function btn_press_backward(){
	$(".blackPiece").stop().css({"backgroundColor": "black"})
	$(".whitePiece").stop().css({"backgroundColor": "white"})	
	if(mi>=0 || gi >0 || player >0){
		if(mi == -1){
			if(gi == 0){
				if(player > 0){
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
			board.remove_piece(game_data[player][gi][mi][3])
			mi--
			if(mi > 0){
				var data = game_data[player][gi][mi-1]
				var color = data[0]
				var move = data[3]
				board.show_last_move(move, color);
				board.evaluate_win(color);
			}
		}
		clearTimeout(timer);
		if(!is_paused){
			timer = setTimeout(btn_press_forward,2000);
		}
		show_game_info()
	}
}

function load_game_data_old(filename){
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
	console.log(game_data.length)
	for(var i=0;i<game_data.length-1;i++){
		var p = parseInt(game_data[i].split(",")[0])
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