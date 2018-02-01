#ifndef BFS_H_INCLUDED
#define BFS_H_INCLUDED

#include "board.h"
#include <vector>
#include <fstream>
#include <random>
using namespace std;

#define BLACK_WINS 4*BOARD_WIDTH
#define WHITE_WINS -4*BOARD_WIDTH
#define DRAW 0

class node{
  private:
    node** child;
    node* parent;
    node* best;
    unsigned int Nchildren;
    uint64 m;
  public:
    board b;
    double val;
    int pess;
    int opt;
    bool player;
    int depth;
    node(){
      val=0.0;
      child=NULL;
      parent=NULL;
      best=NULL;
      Nchildren=0;
      depth=1;
      m=0;
      pess=0;
      opt=0;
    }
    node(board bstart,double v,bool p,int d){
      b=bstart;
      depth=d;
      player=p;
      child=NULL;
      parent=NULL;
      best=NULL;
      Nchildren=0;
      m=0;
      if(b.black_has_won())
      {
          pess=opt=BLACK_WINS-depth;
          val=10000.0;
      }
      else
      {
          if(b.white_has_won())
          {
              pess=opt=WHITE_WINS+depth;
              val=-10000.0;
          }
          else if(b.is_full())
          {
              pess=opt=0;
              val=0.0;
          }
          else
          {
              val=v;
              pess=WHITE_WINS+depth+1;
              opt=BLACK_WINS-depth-1;
          }
      }
    }
    ~node(){
      if(child){
        for(unsigned int i=0;i<Nchildren;i++)
          delete child[i];
        delete[] child;
      }
      parent=NULL;
      best=NULL;
    }
    void expand(vector<zet> candidate){
      Nchildren=(unsigned int)candidate.size();
      if(Nchildren>0){
        child=new node*[Nchildren];
        for(unsigned int i=0;i<Nchildren;i++){
          if(player==BLACK)
            child[i]=new node(b+candidate[i],val+candidate[i].val,!player,depth+1);
          else child[i]=new node(b+candidate[i],val-candidate[i].val,!player,depth+1);
          child[i]->parent=this;
          child[i]->m=candidate[i].zet_id;
        }
        get_opt();
        get_pess();
        get_val();
        if(determined())
          get_best_determined();
        if(parent)
          parent->backpropagate(this);
      }
    }
    void backpropagate(node* changed){
      if(!update_opt(changed))
        get_opt();
      if(!update_pess(changed))
        get_pess();
      if(!changed->determined() && update_val(changed))
        best=changed;
      else get_val();
      if(parent)
        parent->backpropagate(this);
    }
    inline bool determined(){
      return opt==pess;
    }
    inline bool update_val(node* c){
      if((player==BLACK && c->val>val)||(player==WHITE && c->val<val)){
        val=c->val;
        return true;
      }
      return false;
    }
    inline bool update_opt(node* c){
      if((player==BLACK && c->opt>opt)||(player==WHITE && c->opt<opt)){
        opt=c->opt;
        return true;
      }
      return false;
    }
    inline bool update_pess(node* c){
      if((player==BLACK && c->pess>pess)||(player==WHITE && c->pess<pess)){
        pess=c->pess;
        return true;
      }
      return false;
    }
    inline void get_opt(){
      opt=(player==BLACK?WHITE_WINS:BLACK_WINS);
      for(unsigned int i=0;i<Nchildren;i++)
        update_opt(child[i]);
    }
    inline void get_pess(){
      pess=(player==BLACK?WHITE_WINS:BLACK_WINS);
      for(unsigned int i=0;i<Nchildren;i++)
        update_pess(child[i]);
    }
    void get_best_determined(){
      vector<node*> candidate;
      if(player==BLACK){
        for(unsigned int i=0;i<Nchildren;i++)
          if(child[i]->pess==pess)
            candidate.push_back(child[i]);
      }
      else for(unsigned int i=0;i<Nchildren;i++)
        if(child[i]->opt==opt)
          candidate.push_back(child[i]);
      best=candidate[0];
    }
    void get_val(){
      val=(player==BLACK?-20000.0:20000.0);
      for(unsigned int i=0;i<Nchildren;i++)
        if(!child[i]->determined() && update_val(child[i]))
          best=child[i];
      for(unsigned int i=0;i<Nchildren;i++)
        if(child[i]->determined())
          update_val(child[i]);
    }
    node* select(){
      if(best)
        return best->select();
      return this;
    }
    zet bestmove(){
      double v;
      uint64 m_best=999;
      if(!best)
        return zet(0,val,player);
      if(determined()){
        get_best_determined();
        return zet(best->m,val,player);
      }
      v=(player==BLACK?-20000.0:20000.0);
      for(unsigned int i=0;i<Nchildren;i++)
      {
          if((player==BLACK && child[i]->val>v)||(player==WHITE && child[i]->val<v))
          {
              v=child[i]->val;
              m_best=child[i]->m;
          }
      }
      return zet(m_best,v,player);
    }
    bool stop(double thresh,bool talk=false){
      if(determined())
        return true;
      if(Nchildren==0)
        return false;
      if(talk){
        cout<<((player==BLACK)?"BLACK":"WHITE")<<endl;
        for(unsigned int i=0;i<Nchildren;i++)
          cout<<(child[i]->determined() || child[i]!=best)<<"\t"<<val-child[i]->val<<endl;
        cin.get();
      }
      for(unsigned int i=0;i<Nchildren;i++)
        if((child[i]->determined() || child[i]!=best) &&
          (((player==BLACK) && val-child[i]->val<thresh) || ((player==WHITE) && val-child[i]->val>-thresh)))
          return false;
      return true;
    }
};

#endif // BFS_H_INCLUDED
