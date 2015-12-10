function Blob (world, r, c) {

	this.spr = sim.add.sprite(c * BLOCK_WIDTH, r * BLOCK_HEIGHT, 'blob');
	this.spr.width = BLOCK_WIDTH;
	this.spr.height = BLOCK_HEIGHT;
	this.pos = [r, c]
	this.posKey = r + "," + c;
	this.env = {};
	this.alpha = 0.5;
	this.gamma = 0.9
	this.epsilon = 0.1;
	this.speed = 100;

	this.chooseAction = function (actions) {
		var Q = this.QArray(this.posKey, actions);
		maxQ = Math.max.apply(Math, Q);

		if (Math.random() < this.epsilon) {
			var mag = Math.max(Math.abs(Math.min.apply(Math, Q)), Math.abs(maxQ));
			// Readjust Q array
			Q = Q.map(function (x) { return x + Math.random() * mag - 0.5*mag; });
			maxQ = Math.max.apply(Math, Q);
		}

		var best = [];
		for (var i = 0; i < Q.length; i++) {
			if (Q[i] == maxQ) best.push(actions[i]);
		}
		var pick = best[Math.floor(Math.random() * best.length)]
		return pick;
	}

	this.getPossibleActions = function (pos) {
		var nextStates = [];
		var N = [pos[0] - 1, pos[1]];
        var S = [pos[0] + 1, pos[1]];
        var E = [pos[0], pos[1] + 1];
        var W = [pos[0], pos[1] - 1];
        var candidates = [N, S, E, W];
        var actions = [[-1, 0], [1, 0], [0, 1], [0, -1]]
        for (var i = 0; i < candidates.length; i++) {
        	if (isValidBoardPosition(candidates[i])) {
        		nextStates.push(actions[i]);
        	}
        }
        return nextStates;
	}

	this.act = function () {
		var possibleActions = this.getPossibleActions(this.pos);
		var thisState = this.pos;
		var thisAction = this.chooseAction(possibleActions);
		var nextState = [thisState[0] + thisAction[0], thisState[1] + thisAction[1]];
		var nextActions = this.getPossibleActions(nextState);

		// Distribute reward
		var stateKey = thisState[0] + "," + thisState[1];
		Qsa = this.getQ(stateKey + ":" + thisAction);
		var rewardTerm = getReward(nextState);
		var gammaTerm = this.gamma * Math.max.apply(Math, this.QArray(stateKey, nextActions));
		this.env[stateKey + ":" + thisAction] = Qsa + this.alpha * (rewardTerm + gammaTerm - Qsa);
		this.pos = nextState;
		this.posKey = nextState[0] + "," + nextState[1];
		return this.pos;
	}

	this.QArray = function (stateKey, actions) {
		var Q = [];
		for (var i = 0; i < actions.length; i++) {
			var a = actions[i];
			Q.push(this.getQ(stateKey + ":" + a));
		}
		return Q;
	}

	this.getQ = function (pair) {
		if (pair in this.env) {
			return this.env[pair];
		} else {
			this.env[pair] = 0;
			return 0;
		}
	}

	this.setPosition = function (r, c) {
		this.pos = [r, c]
		this.posKey = r + "," + c;
		this.spr.x = 300;
		this.spr.y = r * BLOCK_HEIGHT;
	}

	this.resetBrain = function () {
		this.env = {};
	}
}