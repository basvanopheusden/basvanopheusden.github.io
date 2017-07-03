function Condition_AI() {

    var that = this;
    this.p = player;
		
	this.choose_opponent_move = Module.cwrap('makemove', 'number', ['number','number','number','number'])
	
	this.arraytouint64 = function(array){
		var s=0
		for(var i=0;i<36;i++)
			s+=Math.pow(2,i)*array[i]
		return s
	}
	
    this.opponent_move = function() {
		that.b.game_status = 'playing';
		var bp=that.arraytouint64(that.b.black_position)
		var wp=that.arraytouint64(that.b.white_position)
		console.log(bp,wp)
        that.b.last_move = that.choose_opponent_move(Date.now(),bp,wp,that.p.opponent_color);
		console.log(that.b.last_move)
		if (that.b.game_status != 'ready') {
            that.b.add_piece(that.b.last_move, that.p.opponent_color);
            that.b.show_last_move(that.b.last_move, that.p.opponent_color);
            that.b.evaluate_win(that.p.opponent_color);
        }
        if (that.b.game_status == 'playing') {
            that.init_turn();
        }
		else {
			setTimeout(function(){that.start_game();},500);
		}
    }

    this.tileClickHandler = function(e) {
        that.p.move_end = Date.now();
        $('.tile').off('mouseenter').off('mouseleave').off('click');
        $('.canvas, .canvas div').css('cursor', 'none');
        $('.headertext').text('Waiting for opponent').css('color', '#333333');
        that.p.move = parseInt(e.target.id);
        that.b.add_piece(that.p.move, that.p.color);
        that.b.show_last_move(that.p.move, that.p.color);
        that.b.evaluate_win(that.p.color); 
        that.p.duration = that.p.move_end - that.p.move_start;
        setTimeout(function(){that.opponent_move();},500);
    }

    this.init_turn = function(){
        that.p.move_start = Date.now();
        that.b.highlight_tiles();
        $('.headertext').text('Your turn').css('color', '#000000');
        $('.canvas, .tile').css('cursor', 'pointer');
        $('.usedTile, .usedTile div').css('cursor', 'default');
        $('.tile').off('click').on('click', function(e) { that.tileClickHandler(e); });
    }
    
    this.start_game = function() {
        that.b = new Board();
        that.b.create_tiles();
        that.current_opponent = 5;
		that.init_turn();
    }

    this.run = function() {
		var result = Module.ccall('makemove', 'number', ['number'], [28]); // arguments
		
		that.practice_start_time= Date.now(); 
		that.start_game();
    }
}
