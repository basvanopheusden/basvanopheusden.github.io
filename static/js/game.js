function Board() {
	this.canvas = $(".canvas");
	this.tile_ids = [];
	for (var i = 0; i <= M*N; i++) {this.tile_ids.push(i);};
	this.tiles = [];
	this.black_piece = "<div class='blackPiece'></div>";
	this.white_piece = "<div class='whitePiece'></div>";
	this.black_position = restore_array("000000000000000000000000000000000000");
	this.white_position = restore_array("000000000000000000000000000000000000");
	this.game_status = "ready";
	this.move_index = 0;
	this.last_move = 99;
	var that = this;

	this.canvas.empty();

	this.create_tiles = function() {
		for (i=0; i<N; i+=1) {
			for(j=0; j<M; j+=1) {
				var tile_div = "<div class = 'tile' id='" + this.tile_ids[i*M + j] + "'></div>";
				that.canvas.append(tile_div);
			}
			that.canvas.append("<br>");
		}
		that.tiles = _.map(that.tile_ids, function(el){ return $("#" + String(el))}); 
	}

	this.highlight_tiles = function() {
		that.mouse_on = $('.tile')
			.on('mouseenter', function(){ $(this).animate({backgroundColor:square_highlight}, 50)})
			.on('mouseleave', function(){ $(this).animate({backgroundColor:square_bkgcolor}, 50)});
	}

	this.add_piece = function(loc, col) {
		if(col == 0) {
			that.tiles[loc].append(that.black_piece).removeClass("tile").addClass("usedTile").off('mouseenter').off('mouseleave').css("backgroundColor", square_bkgcolor);
			that.black_position[loc] = 1;
		} else {
			that.tiles[loc].append(that.white_piece).removeClass("tile").addClass("usedTile").off('mouseenter').off('mouseleave').css("backgroundColor", square_bkgcolor);
			that.white_position[loc] = 1;
		}
	}
	
	this.remove_piece = function(loc){
		that.tiles[loc].empty().removeClass("usedTile").addClass("tile").off().css("backgroundColor", square_bkgcolor);
		that.black_position[loc]=0
		that.white_position[loc]=0
	}

	this.show_last_move = function(loc, col) {
		if(col == 0) {
			$(".blackShadow").remove();
			that.tiles[loc].append("<div class='blackShadow'></div>");
		} else {
			$(".whiteShadow").remove();
			that.tiles[loc].append("<div class='whiteShadow'></div>");
		}
	}

	this.evaluate_win = function(col) {
		var win_state = build_array(K, 1, 0);
		var array = col == 0 ? that.black_position : that.white_position
		break_block: {
			row:
				for(i=0; i<N; i++) {
			start:
					for(j=0; j<=M-K; j++) {
						var h_win = 0;
			seq:
						for(h=0; h<K; h++) {
							h_win += array[i*M + j + h];
							win_state[h] = i*M + j + h;
						}
						if(h_win == 4) {
							that.update_game_status("win", col, win_state)
							break break_block
						} else {
							continue
						}
					}
				}
			column:
				for(j=0; j<M; j++) {
					var v_win = 0
			start:
					for(i=0; i<=N-K; i++) {
			seq:
						for(h=0; h<K; h++) {
							v_win += array[j + M*i +M*h];
							win_state[h] = j + M*i + M*h;
						}
						if(v_win == 4) {
							that.update_game_status("win", col, win_state)
							break break_block
						} else {
							continue
						}
					}
				}
			column:
				for(j=0; j<=M-K; j++) {
					var dd_win = 0
			start:
					for(i=0; i<=N-K; i++) {
			seq:
						for(h=0; h<K; h++) {
							dd_win += array[j + (M+1)*i + (M+1)*h];
							win_state[h] = j + (M+1)*i + (M+1)*h;
						}
						if(dd_win == 4) {
							that.update_game_status("win", col, win_state)
							break break_block
						} else {
							continue
						}
					}
				}
			column:

				for(i=K-1; i<M; i++){
					var du_win = array[i] + array[i+8] + array[i+16] + array[i+24];
					if(du_win==4){
						win_state = [i, i+8, i+16, i+24];
						that.update_game_status("win", col, win_state);
						break break_block
					} else {
						continue
					}
				}

			var is_draw = 0;
			for(i=0; i<M*N; i++) {
				is_draw += this.black_position[i] + this.white_position[i];
			}
			if(is_draw < M*N) {
				that.update_game_status("playing", col, win_state);
			} else {
				that.update_game_status("draw", col, win_state);
			}
		}
	}

	this.update_game_status = function(status, col, array) {
		that.game_status = status;
		if(that.game_status != "playing"){
			that.show_win(col, array);
		}
	}

	this.show_win = function(col, array) {
		if (that.game_status == "win") {
			for(i=0; i<array.length; i++){
				col == 0 ? $("#" + array[i] + " .blackPiece").animate({"backgroundColor": win_color}, 250) : $("#" + array[i] + " .whitePiece").animate({"backgroundColor": win_color}, 250);
			}
		}
	}
}

function Player() {
	this.initials = $("#nameInputField").val();
	this.last_initials = this.initials;
	this.color = 0
	this.score = 0
	this.opponent_score = 0
	this.game_index = 0
	this.scorebox = $('#leftScorebox')
	this.scoretext = $('#leftScorebox p')
	this.opponent_scorebox = $('#rightScorebox')
	this.opponent_scoretext = $('#rightScorebox p')
	this.opponent_color = 1
	this.opponent_initials = "QQ"
	this.show_name = $("#leftScorebox h2").text(this.initials);
	this.move = 99
	this.move_start = 0
	this.move_end = 0
	this.duration = 0
	this.mouse_t = [];
	this.mouse_x = [];
}