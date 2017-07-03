#include "board.h"
#include "heuristic.h"
#include "bfs.h"
#include <ctime>
using namespace std;

extern "C" {

int makemove(int seed, uint64 bp, uint64 wp, bool player){
  heuristic h;
  zet m;
  int wait_time;
  mt19937_64 generator;
  board b(bp,wp);
  generator.seed(seed);
  h.seed_generator(generator);
  m=h.makemove_bfs(b,player);
  wait_time=(h.iterations==0?2500:((4000*sqrt(h.iterations*h.gamma)+500)));
  b.add(m);
  /*cout<<uint64totile(m.zet_id)<<endl<<uint64tobinstring(b.pieces[BLACK])<<endl<<uint64tobinstring(b.pieces[WHITE])<<endl;
  if(is_win(b.pieces[player]))
    cout<<"win"<<endl;
  else if(b.is_full())
    cout<<"draw"<<endl;
  else cout<<"playing"<<endl;*/
  return uint64totile(m.zet_id);
}

}
