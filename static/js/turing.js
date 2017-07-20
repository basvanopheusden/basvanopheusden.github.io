var clip, trial_start
var clip_files = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179]
var clip_answers = [0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,1,1,1,0,1,0,0,0,1,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,0,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,0,0,1,0,1,1,0,0,1,1,0,0,0,0,1,0,0,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1,0,1,1,0,0,1,0,1,1,0,1,1,1,0,0,1,0,1,1,1,1,0,0,0,1,0,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,0,1,1,0,0,1,0,0,0,0,0,0]

var clip_played = []
//humans: 1; computers: 0

var feedback, answer;
var is_paused = 1;
var game_data = null;
var timer = null;

function getClip(clipno) {
    return 'https://basvanopheusden.github.io/media/video/turing_videos/' + String(clipno) + '.mp4'
}

function start(data){
	game_data = data
	$(document).off().on('keydown', function(e){keypress_handler(e)});
	$('#turing-stim').prop('defaultPlaybackRate',10)
	$('#slider').prop('disabled', true).css('cursor','default')
	select_random_trial()
}

function select_random_trial(){
	player = Math.floor((Math.random() * game_data.length));
	ti = Math.floor((Math.random() * game_data[player].length));
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

function load_game_data(filename){
	$.getJSON(filename, function(response) {
		start(response)
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
	var participant = process_name(game_data[player][ti])
	$('.headertext').text("participant" + participant.toString())
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
		if($('#turing-stim').prop("ended")){
			timer = setTimeout(btn_press_forward,2000);
		}
		$("#button_play").css("background-color", "#ffa500");
	}
}

function loadVideo(clipno,callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', getClip(clipno));
    xhr.responseType = 'blob';
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
            var url = window.URL || window.webkitURL;
            $('#stim-source').attr('src', url.createObjectURL(this.response));
            $('#turing-stim').load();
			callback();
        } else if (this.readyState == 4) {
            console.log(this.status);
        }
    }
    xhr.send();
}

function load_state(){
	var data = game_data[player][ti]
	var clipno = data[0]
	var choice = data[1]
	$('#feedback-text').text("1234").css({"color" : "white"});
	$('#slider').stop().val(50);
	loadVideo(clipno, function(){
		$('#turing-stim').controls = false;
		document.getElementById('turing-stim').play();	
	})
	$('#turing-stim').on('ended',function(e){
		clearTimeout(timer);
		var feedback = ((choice>=50) == clip_answers[clipno]) ? "Correct!" : "Incorrect."
		timer = setTimeout(function(){
			$({slideValue : 50}).animate({slideValue : choice},{
				step:function(now){
					$('#slider').val(Math.ceil(now));
				},
				duration:500, 
				easing: 'linear',
				complete: function(){
					$('#feedback-text').css({"color" : "black"}).text(feedback).fadeIn(400)
				}
			});
			if(!is_paused){
				clearTimeout(timer);
				timer = setTimeout(btn_press_forward,2150);
			}
		},650)
	})
	show_trial_info()
}

function btn_press_forward() {
	if(ti < game_data[player].length-1 || player < game_data.length-1){
		ti++
		if(ti == game_data[player].length){
			player++
			ti = 0	
		}
	}
	load_state()
}

function btn_press_backward(){
	if(ti > 0 || player > 0){
		if(ti == 0){
			player--
			ti = game_data[player].length
		}
		ti--
	}
	load_state()
}

function load_game_data_old(filename){
	$.get(filename, function(response) {
		game_data = response.split("\n");
		make_json();
	});
}

function make_json(){
	player = "AD";
	x=[]
	y=[]
	for(var i=0;i<game_data.length-1;i++){
		var p = game_data[i].split(",")[0]
		var clip = parseInt(game_data[i].split(",")[1])
		var resp = parseInt(game_data[i].split(",")[3])
		if(p != player){
			player = p 
			x.push(y)
			y=[]
		}
		y.push([clip,resp])
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
