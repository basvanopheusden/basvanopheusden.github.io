var eye_tracking = [new Eye_Calibration(), 
				new Condition_AI(20),
				new Eye_Calibration(), 
				new Condition_AFC2(), 
				new End_Message()];

var generalization = [ new Condition_AI(30), 
						new Condition_AFC2(), 
						new Condition_Evaluation(), 
						new End_Message()];

var learning = {};

learning.even = [new Condition_AI(60), 
				new End_Message()];

learning.odd = [new Condition_AI(30), 
				new Condition_AFC2(),
				new Condition_Evaluation(),
				new End_Message()];

reconstruction = [new Eye_Calibration, new Reconstruction()];

demo = [new Demo(60),
		new End_Message()]

