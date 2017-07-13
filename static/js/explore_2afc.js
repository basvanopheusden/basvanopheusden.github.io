var is_paused = 1;
var game_data;
timer = null;

function start(){
	$(document).on('keydown', function(e){keypress_handler(e)});
	select_random_trial()
}

function select_random_trial(){
	player = Math.floor((Math.random() * game_data.length) + 1);
	ti = Math.floor((Math.random() * game_data[player].length) + 1);
	load_state()
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

function load_data(){
	var filename = "https://basvanopheusden.github.io/data/2afc.json"
	$.getJSON(filename, function(response) {
		game_data = response
		start()
	});
}

function process_name(n){
	if(n >= 1000){
		return "Computer " + (n-999).toString()
	}
	else {
		return "Participant " + (n+1).toString()
	}
}

function show_trial_info(){
	var color = game_data[player][ti][0]
	$('.headertext').text(process_name(game_data[player][ti][4]))
	$('.headertext2').text("Trial " + (ti+1).toString() + ", " + ((color==1)?"White":"Black") + " to move")
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
	var data = game_data[player][ti]
	var color = data[0]
	var bp = data[1]
	var wp = data[2]
	var move = data[3]
	var move1 = data[5]
	var move2 = data[6]
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
	board.tiles[move1].append("<div class='" + (color==0?"black":"white") + "Choice' id='" + move1.toString() + "'></div>");
	board.tiles[move2].append("<div class='" + (color==0?"black":"white") + "Choice' id='" + move2.toString() + "'></div>");
	clearTimeout(timer);
	timer = setTimeout(function(){
		$('#' + move.toString() + '.tile').append("<i class='fa fa-times chosenTile' aria-hidden='true' style=\"color: " + (color==0?"#000000":"#FFFFFF") + "\"></i>");
		if(!is_paused){
			clearTimeout(timer);
			timer = setTimeout(btn_press_forward,1350);
		}
	},650)
	show_trial_info()
}

function btn_press_forward() {
	ti++
	if(ti == game_data[player].length){
		player++
		ti = 0		
	}
	clearTimeout(timer);
	if(!is_paused){
		timer = setTimeout(btn_press_forward,2000);
	}
	load_state()
}

function btn_press_backward(){
	if(ti == 0){
		player--
		ti = game_data[player].length
	}
	ti--
	clearTimeout(timer);
	if(!is_paused){
		timer = setTimeout(btn_press_forward,2000);
	}
	load_state()
}


function load_game_data_old(){
	var filename = "https://basvanopheusden.github.io/data/2afc.csv"
	$.get(filename, function(response) {
		game_data = response.split("\n");
		make_json();
	});
}

function make_json(){
	player = 0;
	x=[]
	y=[]
	for(var i=0;i<game_data.length-1;i++){
		var p = parseInt(game_data[i].split(",")[0])
		var wp = game_data[i].split(",")[3]
		var bp = game_data[i].split(",")[2]
		var color = parseInt(game_data[i].split(",")[1])
		var move = parseInt(game_data[i].split(",")[4])
		var move1 = parseFloat(game_data[i].split(",")[6])
		var move2 = parseFloat(game_data[i].split(",")[7])
		if(p > player && p < 1000){
			player++
			x.push(y)
			y=[]
		}
		y.push([color,bp,wp,move,p,move1,move2])
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