function Condition_AI(dur) {

    // in general, these and the board/player objects are not sufficiently disentangled...
    var that = this;
    this.task_id = 'AI'
    this.duration = dur
    this.start_time = Date.now();
    this.end_time = this.start_time + 60000*this.duration;

    this.current_trial = 0;

    this.opp_list = opponent_list;
    this.current_opponent = sample_array(this.opp_list[Math.floor(this.opp_list.length/2)]);

    this.p = player;
    this.b = new Board();

    this.submit_response = function() {
        console.log('DEBUG: response submitted')
        data = {
            'initials':String(that.p.initials),
            'color':String(that.p.color),
            'gi':String(that.p.game_index),
            'status':String(that.b.game_status),
            'bp':String(that.b.black_position.join('')),
            'wp':String(that.b.white_position.join('')),
            'response':String(that.p.move),
            'rt':String(that.p.duration),
            'ts':String(Date.now()),
            'mt':String(that.p.mouse_t.join(',')),
            'mxy':String(that.p.mouse_x.join(';')),
            'opponent':String(that.current_opponent),
            'task':String(that.task_id)
        };
        that.p.mouse_x = [];
        that.p.mouse_t = [];

        return $.ajax({type:'POST', url:'/AIData', dataType:'JSON', data:data})
    }

    this.get_response = function() {
        console.log("DEBUG: data requested")
        return $.ajax({type:'GET', url:'/AIData', dataType:'JSON', data:{}})
    }

    this.unpack_response = function(data) {
        that.p.game_index = parseInt(data.gi);
        that.b.game_status = parseInt(data.status)
        that.b.black_position = restore_array(data.bp)
        that.b.white_position = restore_array(data.wp)
        that.b.last_move = parseInt(data.response)
        that.p.last_initials = parseInt(data.initials)

        return data
    }

    this.ajax_poll = function(promise, callback) {
        console.log('DEBUG: polling loop continuing')
        promise.then(function(data) {
            that.unpack_response(data);
        }).done(function(data) {
            if(that.p.initials != that.p.last_initials) {
                callback();
            } else {
                setTimeout(function() {
                    get_promise = that.get_response();
                    that.ajax_poll(get_promise, callback);
                }, ajax_freq);
            }
        })
    }

    this.change_opponent = function(p) {
        var ol = that.opp_list.length;
        var first = Math.floor(ol/2);
        var tier = p.opponent_score - p.score + first;
        if (tier > ol - 1) {
            var new_opp = that.opp_list[ol - 1]
        } else if (tier < 0) {
            var new_opp = that.opp_list[0]
        } else {
            var new_opp = that.opp_list[tier]
        }

        return sample_array(new_opp)
    }

    this.init_turn = function() {
        that.p.move_start = Date.now();
        that.b.highlight_tiles() // probably better way to write this
        $('.headertext').text('Your turn').css('color', '#000000');
        $('.canvas, .tile').css('cursor', 'pointer');
        $('.usedTile, .usedTile div').css('cursor', 'default');
    }

    this.afterPromise = function() {
        get_promise = that.get_response();
        if(that.b.game_status == 'ready' || that.b.game_status == 'playing') {
            that.ajax_poll(get_promise, function() { that.opponent_action(); });
        }
    }

    this.tileClickHandler = function(e) {
        console.log('DEBUG: tile clicked')
        // ideally this will be split up into canvas aesthetics, board aesthetics, and io stuff
        that.p.move_end = Date.now();
        $('.tile').off('mouseenter').off('mouseleave').off('click');
        $('.canvas, .canvas div').css('cursor', 'none');
        $('.headertext').text('Waiting for opponent').css('color', '#333333');
        that.p.move = parseInt(e.target.id);
        that.b.move_index ++;
        that.b.add_piece(that.p.move, that.p.color);
        that.b.show_last_move(that.p.move, that.p.color);
        move_sound.play();
        that.b.evaluate_win(that.p.color); // move this to server!
        // if(that.b.game_status=='win' || that.b.game_status=='draw'){ that.p.score ++; $('p0-score h2').text(that.p.score); }
        if(that.b.game_status=='win'){ that.p.score ++; $('#p0-score h2').text(that.p.score); }

        that.p.duration = that.p.move_end - that.p.move_start;

        // the below will need to be modified for websocket version
        var send_promise = that.submit_response(that.b, that.p);
        send_promise.done(that.afterPromise);

    }

    this.action = function() {
        console.log('DEBUG: action assigned')
        that.init_turn(); // aesthetics
        $('.tile').off('click').on('click', function(e) { that.tileClickHandler(e); });
    }

    this.opponent_action = function() {
        if (that.b.game_status != 'ready') {
            that.b.add_piece(that.b.last_move, that.p.opponent_color);
            that.b.show_last_move(that.b.last_move, that.p.opponent_color);
            that.b.evaluate_win(that.p.opponent_color); // move to server!
            move_sound.play();
        }
        if (that.b.game_status == 'win') {
            that.p.opponent_score ++;
            $('#p1-score h2').text(that.p.opponent_score);
        } else if (that.b.game_status == 'playing') {
            that.action();
        }
    }

    this.trial_start_promise = function() {
        console.log("DEBUG: get request promise")
        var get_promise = that.get_response();
        that.ajax_poll(get_promise, function() {
            if (that.p.color==0) {
                that.action();
            } else {
                $('.headertext').text('Waiting for opponent').css('color', '#333333');
                that.opponent_action();
            }
        })
    }

    this.first_trial = function() {
        // expand to allow for color setting?
        console.log('DEBUG: First trial function');
        that.start_time = Date.now();
        that.end_time = that.start_time + 60000*that.duration;
        $('.headertext').text('Waiting for opponent').css('color', '#333333');
        var send_promise = that.submit_response();
        send_promise.done(function(data) {
            console.log(data);
            that.trial_start_promise();
        });
    }

    this.further_trial = function() {
        $('.tile').css('cursor', 'none');
        if (that.p.color==1) {
            $('.headertext').text('Waiting for opponent').css('color', '#333333');
        }
        var send_promise = that.submit_response(that.b, that.p);
        send_promise.done(that.trial_start_promise);
    }

    this.do_trial = function() {
        if (that.current_trial == 0) {
            that.first_trial();
        } else if (Date.now() < that.end_time) {
            that.further_trial()
        }
    }

    this.run_block = function() {
        // abstract handlers below as above

        that.b = new Board();
        that.b.create_tiles();
        that.b.highlight_tiles();
        that.p.color = 0;
        that.p.opponent_color = 1;
        // $('#block-modal .modal-body').empty().append(instAI);
        $('#block-modal').modal('show');
        $(document).on('keydown', function(e) {
            if (e.keyCode == 192) {
                e.preventDefault();
                // $('html').css('cursor', 'none');
                that.do_trial();
                $('#block-modal').modal('hide');
                $(document).off('keydown');
            }
        });
        $('#feedback-modal button').on('click', function() {
            $('#feedback-modal').modal('hide');
            $('html').css('cursor', 'none');
            that.current_trial ++;
            that.p.game_index ++;
            that.current_opponent = that.change_opponent(that.p);
            that.p.color = (that.p.color + 1)%2;
            that.p.opponent_color = (that.p.color + 1)%2;
            that.b = new Board();
            that.b.create_tiles();
            that.do_trial();
        });

    }

}

var opponent_list = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[25,26,27,28,29]]
