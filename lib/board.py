import numpy as np

class Board(object):
    def __init__(self, start_position=None):
        if start_position:
            self.current_position = start_position
        else:
            self.current_position = np.zeros(36)

        self.history = [self.current_position]

    def add_piece(self):
        pass

    def check_for_win(self):
        pass

    def remove_piece(self):
        pass