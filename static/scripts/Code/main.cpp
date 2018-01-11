#include "board.h"
#include "heuristic.h"
#include "bfs.h"
#include <ctime>
#include <stdio.h>
#include <string.h>
using namespace std;

const int N_opps_per_level = 6;

struct moveResponse
{
    int index;
    int wait_time;
};

enum gameEndResponse
{
    gameEndResponseBlackWin,
    gameEndResponseWhiteWin,
    gameEndResponseDraw,
    gameEndResponseIncomplete
};

extern "C" {

    moveResponse makemoveresponse(int seed, char* bp, char* wp, bool player, int level, int opp_num_in_level) {

        moveResponse output;
        heuristic h;
        zet m;
        int opp_num = level*N_opps_per_level + opp_num_in_level;
        mt19937_64 generator;
        board b(binstringtouint64(bp),binstringtouint64(wp));

        generator.seed(seed);
        h.seed_generator(generator);
        h.get_params(params[opp_num]);
        m = h.makemove_bfs(b,player);

        cout<<bp<<"\t"<<wp<<endl;

        output.wait_time = (h.iterations == 0 ? 2500 : ((4000 * sqrt(h.iterations * h.gamma ) + 500)));
        b.write(m);
        b.add(m);

        output.index = uint64totile(m.zet_id);
        return output;
    }

    gameEndResponse evaluateGameEnd(char* bp, char* wp)
    {
        board b (binstringtouint64(bp), binstringtouint64(wp));
        cout<<uint64tobinstring(b.pieces[BLACK])<<endl<<uint64tobinstring(b.pieces[WHITE])<<endl;

        if (is_win(b.pieces[BLACK]))
        {
            cout<<"win"<<endl;
            return gameEndResponseBlackWin;
        }
        else if (is_win(b.pieces[WHITE]))
        {
            cout<<"win"<<endl;
            return gameEndResponseWhiteWin;
        }
        else if(b.is_full())
        {
            cout<<"draw"<<endl;
            return gameEndResponseDraw;
        }

        return gameEndResponseIncomplete;
    }

    int makemove(int seed, char* bp, char* wp, bool player, int level, int opp_num_in_level) {
        return makemoveresponse(seed, bp, wp, player, level, opp_num_in_level).index;
    }
}

