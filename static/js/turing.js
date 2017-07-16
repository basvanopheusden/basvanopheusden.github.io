var clip, trial_start
var clip_files = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179]
var clip_answers = [0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,1,1,1,0,1,0,0,0,1,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,0,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,0,0,1,0,1,1,0,0,1,1,0,0,0,0,1,0,0,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1,0,1,1,0,0,1,0,1,1,0,1,1,1,0,0,1,0,1,1,1,1,0,0,0,1,0,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,0,1,1,0,0,1,0,0,0,0,0,0]

var clip_played = []
//humans: 1; computers: 0

var n_trials = clip_files.length;
var trial_no = 0;
var completion = 0;
var feedback, answer;


/*
player.defaultPlaybackRate = 1.8;
    $('#slider-labels p').hide();
    $('.submit-btn').on('click', function(e) { submitHandler(e); }).prop('disabled', true).hide();
    $('.play-btn').on('click', function(e) { playHandler(e); });
    $('#slider').on('click', function(e) { sliderchangeHandler(e); }).hide();
    $('#next-trial').on('click', function() { $('#feedback-modal').modal('hide'); });
   $('#slider').prop('disabled', true).hide();
    $('.play-btn').prop('disabled', false);
  player.controls = false;
var stim_source = $('#stim-source') //document.getElementById('stim-source');
var player = document.getElementById('turing-stim');
    player.play();
    document.getElementById('play').value = "Play next";
    $('.play-btn').prop('disabled', true).fadeOut('slow');
    //$('#feedback-text').text("");
    $('#slider').prop('disabled', false).fadeIn('slow');
    $('#slider-labels p').fadeIn();
    $('.submit-btn').prop('disabled', false);
    $('.submit-btn').fadeIn('slow');

    var val = $('#slider').val();
    answer = clip_answers[i]
    feedback = ((val>=50) == answer);
    feedback_message = (feedback==1) ? "Correct!" : "Incorrect."

    $('.submit-btn').prop('disabled', true).fadeOut('slow');
    $('#slider-labels p').fadeOut('slow');
	
*/

var is_paused = 1;
var game_data = null;
timer = null;

function getClip(clipno) {
    return 'static/media/video/turing_videos/' + String(clipno) + '.mp4'
}

function start(data){
	game_data = data
    player.addEventListener('ended',function(e) { endHandler(e); });
	
	$(document).off().on('keydown', function(e){keypress_handler(e)});
	//select_random_board()
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

function show_game_info(){
	var participant = process_name(game_data[player][gi][0][4])
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
	  timer = setTimeout(btn_press_forward,2000);
	  $("#button_play").css("background-color", "#19DD89");
	}
}

function loadVideo(clipno) {
    // add optional callback
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        console.log("State: ", this.readyState, "Status: ", this.status);
        if (this.readyState == 4 && this.status == 200) {
            var url = window.URL || window.webkitURL;
            stim_source.attr('src', url.createObjectURL(this.response));
            player.load();
        } else if (this.readyState == 4) {
            console.log(this.status);
        }
    }
    xhr.open('GET', getClip(clipno));
    xhr.responseType = 'blob';
    xhr.send();
}

function load_state(){
	var data = game_data[player][ti]
	var clipno = data[0]
	var choice = data[1]
	loadVideo(clipno)
	
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

function show_feedback(){
	$('#slider').fadeOut('slow', function() {
        $('#slider').val(50)
        $('#feedback-text').text(feedback_message).fadeIn('slow', function() {
            setTimeout(function() {
                $('#turing-stim').fadeOut('slow', function() {
                    loadVideo(clip);
                    player.onloadeddata = function() {
                        $('#feedback-text').text("");
                        $('#turing-stim').fadeIn('slow');
                        $('.play-btn').fadeIn('slow');
                    }
                });
            }, 1000);
        });
    });
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


