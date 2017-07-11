
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

function load_state(n){
	bp=game_data[n].split(",")[2]
	wp=game_data[n].split(",")[3]
	for(var i=0; i<M*N; i++)
		if(bp[i]=='1')
}

function btn_press_begin() {

}

function btn_press_end() {

}

function btn_press_forward() {

}

function btn_press_backward() {

}