var is_paused = 0;
var filename = "https://basvanopheusden.github.io/data/games.csv"
var game_data;

function btn_press_play() {
	console.log("hi")
    if(!is_paused){
      is_paused =1;
	  $("#button_play i").attr("class", "fa fa-pause");
	}
	else {
	  is_paused =0;
	  $("#button_play i").attr("class", "fa fa-play");
	}
}

function load_game_data(){
	$.get(filename, function(response) {
		game_data = response.split("\n");
		load_state();
		make_json();
	});
}

function btn_press_play() {
	console.log("hi")
    if(!is_paused){
      is_paused =1;
	  $("#button_play i").attr("class", "fa fa-pause");
	}
	else {
	  is_paused =0;
	  $("#button_play i").attr("class", "fa fa-play");
	}  
}

function load_state(){
	var bp = game_data[n].split(",")[2]
	var wp = game_data[n].split(",")[3]
	var color = parseInt(game_data[n].split(",")[1])
	var move = parseInt(game_data[n].split(",")[4])
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
}

function btn_press_forward() {
	n++;
	load_state()
}

function btn_press_backward() {
	n--;
	load_state()
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
		z.push([color,bp,wp,move])
		if(l == 0 && i>0){
			y.push(z)
			z=[]
		}
		if(p > player && p < 1000){
			player++
			x.push(y)
			console.log(i,x)
			y=[]
		}
	}
	x.push(y)
	console.log(x.length)
    var blob = new Blob([JSON.stringify(x)], {type: 'text/csv'});
	var elem = window.document.createElement('a');
	elem.href = window.URL.createObjectURL(blob);
	elem.download = "games.json";        
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
}