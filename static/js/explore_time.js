var is_paused = 1;
var game_data = null;
timer = null;
var timelist = [5000, 10000, 20000];
var colorlist = ['red', 'blue', 'green'];
var auto_refresh = null

function start(data){
	game_data = data
	board = new Board();
	board.create_tiles();
	$(document).off().on('keydown', function(e){keypress_handler(e)});
	select_random_board()
}

function select_random_board(){
	if(game_data != null){
		player = Math.floor((Math.random() * game_data.length));
		gi = Math.floor((Math.random() * game_data[player].length));
		mi = Math.floor((Math.random() * game_data[player][gi].length));
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
	$.getJSON(filename, function(response) {
		start(response)
	});
}

function process_name(n){
	if(n >= 1000){
		return "Computer " + ((n-1000)%30 + 1 ).toString()
	}
	else {
		return "Participant " + (n+1).toString()
	}
}

function show_game_info(){
	var color = (mi>=0 ? game_data[player][gi][mi][0] : 0)
	var blackplayer = process_name(game_data[player][gi][0][4])
	var whiteplayer = process_name(game_data[player][gi][1][4])
	$('.headertext').text("Black: " + blackplayer + ", White: " + whiteplayer)
	$('.headertext2').text("Move " + (mi+1).toString() + ", " + ((color==0)?"Black":"White") + " to move")
}

function btn_press_play() {
	if(!is_paused){
      is_paused = 1;
	  $("#button_play i").attr("class", "fa fa-play");
	  $("#button_play").css("background-color", "#dddddd");
	}
	else {
	  is_paused = 0;
	  $("#button_play i").attr("class", "fa fa-pause");
	  $("#button_play").css("background-color", "#ffa500");
	}
}

function get_time_limit_condition(x){
	for(var i=0;i<x.length;i++)
		if(x[i][4]>999)
			return Math.floor((x[i][4]-1000)/30 - 1)
	return 0
}

function reset_timer(numTimer, visTimer) {
	auto_refresh = null;
	numTimer.text(timerStart/1000);
	visTimer.stop(true,true).animate({height: timerStartHeight}, {duration: 300});
	visTimer.css({backgroundColor: timerStartColor});
	timerCurrent = timerStart;
}

this.draw_time = function(numTimer, visTimer, timeridx) {
	timerStart = timelist[timeridx];
	timerCurrent = timelist[timeridx];
	timerStartColor = colorlist[timeridx];
	timerCurrentColor = timerStartColor;
	timerStartHeight = (timerStart * ((403/20)/1000) + 'px');
	numTimer.text(timerStart/1000);
}
	
function start_timer(numTimer, visTimer) {
	if (auto_refresh != null) {
	     return;
	}
    auto_refresh = setInterval(function() {
        timerCurrent += -1000;
        numTimer.text(timerCurrent/1000);
	    if (timerCurrent <= 0) {
	        Beep(1200, 500);
	        numTimer.text('time out');
	        clearInterval(auto_refresh);
	    } else if (timerCurrent/1000 <= 5) {
			visTimer.animate({backgroundColor: 'red'});
     	} else if (timerCurrent/1000 <= 10) {
          	visTimer.animate({backgroundColor: 'blue'});
      	} else { 
	      	visTimer.css('background-color', 'green');
	    };
	    if (timerCurrent/1000 == 2) {
			Beep(300, 250);
	    } else if (timerCurrent/1000 == 1) {
	      	Beep(600, 250);
	    }
   	}, 1000);
	visTimer.stop(true, true).animate({height: '0px'}, {duration:timerStart-250, easing:'linear', queue:false});
};

function active_player(){
	return game_data[player][gi][mi][4]>=1000 ? "opponent" : "player"
}

function start_timers(){
	clearInterval(auto_refresh);
	reset_timer($('#numTimer'),$('#visTimer'));
	reset_timer($('#numTimerOpp'),$('#visTimerOpp'));
	if(active_player() == "player"){
		start_timer($('#numTimer'),$('#visTimer'));
	}
	else {	
		start_timer($('#numTimerOpp'),$('#visTimerOpp'));	
	}
}

function makemove(move,color){
	board.add_piece(move,color);
	board.show_last_move(move, color);
	board.evaluate_win(color);
	clearTimeout(timer);
	clearInterval(auto_refresh);
	auto_refresh = null;
	$('#numTimer, #visTimer, #numTimerOpp, #visTimerOpp').stop();
}

function load_state(){
	board = new Board()
	board.create_tiles()
	time_limit_condition = get_time_limit_condition(game_data[player][gi])
	draw_time($('#numTimer'),$('#visTimer'),time_limit_condition);
	start_timers()
	if(mi>=0){
		var bp = game_data[player][gi][mi][1]
		var wp = game_data[player][gi][mi][2]
		var move = game_data[player][gi][mi][3]
		var color = game_data[player][gi][mi][0]
		for(var i=0; i<M*N; i++){
			if(bp[i]=='1'){
				board.add_piece(i, 0);
			}
			if(wp[i]=='1'){
				board.add_piece(i, 1);
			}
		}
		clearTimeout(timer);
		timer = setTimeout(function(){
			makemove(move,color)
			if(!is_paused){
				btn_press_forward();
			}
		},3456);
		if(mi>0){
			var lastmove = game_data[player][gi][mi-1][3]
			var lastcolor = game_data[player][gi][mi-1][0]
			board.show_last_move(lastmove, lastcolor);
		}
	}
	show_game_info()
}

function btn_press_forward(){
	if(mi<game_data[player][gi].length-1 || gi<game_data[player].length-1 || player<game_data.length-1){
		var move = game_data[player][gi][mi][3];
		var color = game_data[player][gi][mi][0];
		if((color ? board.white_position[move] :board.black_position[move]) == 0){
			makemove(move,color);
		}
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
			var move = game_data[player][gi][mi][3];
			var color = game_data[player][gi][mi][0];
			clearTimeout(timer);
			timer = setTimeout(function(){
				makemove(move,color)
				if(!is_paused){
					btn_press_forward();
				}
			},3456);
		}
		start_timers()
		show_game_info()
	}
}

function btn_press_backward(){
	$(".blackPiece").stop().css({"backgroundColor": "black"})
	$(".whitePiece").stop().css({"backgroundColor": "white"})	
	if(mi>=0 || gi >0 || player >0){
		if(mi == 0){
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
			board.remove_piece(game_data[player][gi][mi][3])
			start_timers()
			clearTimeout(timer);
			var move = game_data[player][gi][mi][3]
			var color = game_data[player][gi][mi][0]
			timer = setTimeout(function(){
				makemove(move,color)	
				if(!is_paused){
					btn_press_forward();
				}
			},3456);
			if(mi>0){
				var lastmove = game_data[player][gi][mi-1][3]
				var lastcolor = game_data[player][gi][mi-1][0]
				board.show_last_move(lastmove, lastcolor);
			}
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

var audioCtx = new AudioContext()
var hifreq = 2000,
	mifreq = 1000,
	lofreq = 500;
	function makeDistortionCurve(amount) {
	  var k = typeof amount === 'number' ? amount : 50,
	    n_samples = 44100,
	    curve = new Float32Array(n_samples),
	    deg = Math.PI / 180,
	    i = 0,
	    x;
	  for ( ; i < n_samples; ++i ) {
	    x = i * 2 / n_samples - 1;
	    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
	  }
	  return curve;
}

function Beep(freq, dur) {
	var osc1 = audioCtx.createOscillator();
	var gain = audioCtx.createGain();
	var disto = audioCtx.createWaveShaper();
	osc1.connect(disto);
	disto.connect(gain);
	gain.connect(audioCtx.destination);
	osc1.type = 'sine';
	osc1.frequency.value = freq;
	gain.gain.value = .3;
	disto.curve = makeDistortionCurve(100);
	disto.oversample = '4x';
	osc1.start(0);
	setTimeout(function() {
	osc1.stop();
	}, dur);
}  
