function Condition_AI() {

    var that = this;
    this.p = player;
		
    this.opponent_move = function() {
		that.b.game_status = 'playing';
		$('.tile').off('mouseenter').off('mouseleave').off('click');
		$('.canvas, .canvas div').css('cursor', 'none');
		$('.headertext h1').text('Waiting for opponent').css('color', '#333333');
		var bp=that.b.black_position.join("")
		var wp=that.b.white_position.join("")
		setTimeout(function(){
			that.b.last_move = that.makemove(Date.now(),bp,wp,that.p.opponent_color);
			console.log(that.b.last_move)
			that.b.add_piece(that.b.last_move, that.p.opponent_color);
			that.b.show_last_move(that.b.last_move, that.p.opponent_color);
			that.b.evaluate_win(that.p.opponent_color);
			if (that.b.game_status == 'playing') {
				that.init_turn();
			}
			if (that.b.game_status == 'win') {
				that.p.opponent_score ++;
				$('#p1-score h2').text(that.p.opponent_score);
			}
		},500);
    }

    this.tileClickHandler = function(e) {
        that.p.move_end = Date.now();
        that.p.move = parseInt(e.target.id);
        that.b.add_piece(that.p.move, that.p.color);
        that.b.show_last_move(that.p.move, that.p.color);
        that.p.duration = that.p.move_end - that.p.move_start;
        that.b.evaluate_win(that.p.color);
		if(that.b.game_status=='win'){ 
			that.p.score ++; 
			$('#p0-score h2').text(that.p.score); 
		}
        that.opponent_move();
    }

    this.init_turn = function(){
        that.p.move_start = Date.now();
        that.b.highlight_tiles();
        $('.headertext h1').text('Your turn').css('color', '#000000');
        $('.canvas, .tile').css('cursor', 'pointer');
        $('.usedTile, .usedTile div').css('cursor', 'default');
        $('.tile').off('click').on('click', function(e) { that.tileClickHandler(e); });
    }
    
    this.start_game = function() {
		that.b = new Board();
        that.b.create_tiles();
        that.current_opponent = 5;
		if(that.p.color==0){
			that.init_turn();
		}
		else {
			that.opponent_move()
		}
    }

    this.run = function() {		
		$('#feedback-modal button').on('click', function() {
            $('#feedback-modal').modal('hide');
            $('html').css('cursor', 'none');
            that.p.color = (that.p.color + 1)%2;
            that.p.opponent_color = (that.p.color + 1)%2;
			that.start_game();
		});
		that.makemove = Module.cwrap('makemove', 'number', ['number','string','string','number'])
		that.start_game();
    }
}
