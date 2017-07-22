var clip, trial_start
var clip_files = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179]
var clip_answers = [0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,1,1,1,0,1,0,0,0,1,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,0,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,0,0,1,0,1,1,0,0,1,1,0,0,0,0,1,0,0,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1,0,1,1,0,0,1,0,1,1,0,1,1,1,0,0,1,0,1,1,1,1,0,0,0,1,0,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,0,1,1,0,0,1,0,0,0,0,0,0]

var clip_played = []
//humans: 1; computers: 0

var stim_source 
var player
var n_trials = clip_files.length;
var trial_no = 0;
var completion = 0;
var feedback, answer;

$(document).ready(function() {
	stim_source = $('#stim-source') 
	player = document.getElementById('turing-stim');
	player.defaultPlaybackRate = 1.8;
    i = Math.floor(Math.random() * clip_files.length);
    clip = clip_files[i]
    $('#slider-labels p').hide();
    initPlayer();
    loadVideo(clip);
    experiment_start = Date.now();
    $('.submit-btn').on('click', function(e) { submitHandler(e); }).prop('disabled', true).hide();
    $('.play-btn').on('click', function(e) { playHandler(e); });
    player.addEventListener('ended',function(e) { endHandler(e); });
    $('#slider').on('click', function(e) { sliderchangeHandler(e); }).hide();
})

function initPlayer() {
    player.controls = false;
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
        } else {
            //not ready yet
        }
    }

    xhr.open('GET', getClip(clipno));
    xhr.responseType = 'blob';
    xhr.send();

    $('#slider').prop('disabled', true).hide();
    $('.play-btn').prop('disabled', false);

}

function playHandler(e) {
    trial_start = Date.now();
    player.play();
    document.getElementById('play').value = "Play next";
    $('.play-btn').prop('disabled', true).fadeOut('slow');
    //$('#feedback-text').text("");
}

function endHandler(e){
    $('#slider').prop('disabled', false).fadeIn('slow');
    $('#slider-labels p').fadeIn();
}

function sliderchangeHandler(e){
    $('.submit-btn').prop('disabled', false);
    $('.submit-btn').fadeIn('slow');
}

function submit_response(val) {
    var response = {
        choice: val,
        experiment_start: experiment_start,
        trial_start: trial_start,
        timestamp: Date.now(),
        clip_id: clip,
        feedback: feedback
    }

    return $.ajax({type: 'POST', url: '/turing', dataType:'JSON', data:response})
}

function submitHandler(e) {
    var val = $('#slider').val();
    answer = clip_answers[i]
    feedback = ((val>=50) == answer);
    feedback_message = (feedback==1) ? "Correct!" : "Incorrect."

    res = submit_response(val);
    res.done(console.log('Data sent!'));
    clip_played.push(clip_files[i]);
    clip_files.splice(i,1);
    clip_answers.splice(i,1);
    if (clip_files.length!==0){
        i = Math.floor(Math.random() * clip_files.length);
        trial_no ++;
        completion = Math.floor(100 * trial_no / n_trials)
        $('#remaining-trials').text(String(completion) + '%');

    }

    clip = clip_files[i];
    $('.submit-btn').prop('disabled', true).fadeOut('slow');
    $('#slider-labels p').fadeOut('slow');
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

function getClip(clipno) {
    var clip_prefix = 'https://basvanopheusden.github.io/media/video/turing_videos/'
    return clip_prefix + String(clipno) + '.mp4'
}
