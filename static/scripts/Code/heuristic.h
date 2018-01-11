#ifndef HEURISTIC_H_INCLUDED
#define HEURISTIC_H_INCLUDED
//#define DEFAULT_WEIGHTS

#include "board.h"
#include <random>
#include <vector>
#include <map>
using namespace std;

struct pattern{
  uint64 pieces;
  uint64 pieces_empty;
  int n;
  double weight_act;
  double weight_pass;
  double drop_rate;
  int ind;
  pattern(uint64,uint64,int,double*,double*,double*,int);
  bool is_active(board&);
  bool contained(board&);
  bool contained(board&,bool);
  bool just_active(board&);
  bool isempty(uint64);
  uint64 missing_pieces(board&,bool);
  double diff_act_pass();
  void update(double*,double*,double*);
};

class heuristic{
  public:
    static const unsigned int Nweights=17;
    double center_weight;
    double w_act[Nweights];
    double w_pass[Nweights];
    double delta[Nweights];
    unsigned int Nfeatures;
    double D0,K0;
    double stopping_thresh,pruning_thresh,gamma,lapse_rate,opp_scale;
    double exploration_constant;
    bool self;
    int iterations;
    double tree_stats[4];
    vector<pattern> feature;
    vector<pattern> feature_backup;
    map<uint64,double> vtile;
    //vector<pattern> feature_backup2;
    mt19937_64 engine;
    geometric_distribution<int> iter_dist;
    normal_distribution<double> noise;
    bernoulli_distribution lapse;
    heuristic();
    void get_params_from_file(char*,int);
    void get_params_from_file(char*,int,int);
    void get_params_from_matlab(double*);
    void get_params(int*);
    void get_features_from_file(char*);
    void addfeature(uint64, int );
    void addfeature(uint64, uint64, int , int );
    void update();
    void seed_generator(mt19937_64);
    void update_weights();
    double evaluate(board, zet);
    double evaluate(board);
    vector<zet> get_pruned_moves(board&, bool);
    vector<zet> get_moves(board&, bool, bool);
    zet makerandommove(board,bool);
    zet makemove_bfs(board,bool);
    int playout(board,bool);
    void remove_features();
    void restore_features();
    void eliminate_noise();
};

#endif // HEURISTIC_H_INCLUDED
