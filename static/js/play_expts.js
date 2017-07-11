
var is_paused = 0;

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