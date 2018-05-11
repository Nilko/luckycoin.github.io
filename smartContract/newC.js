'use strict';
var History = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.bet = obj.bet;
		this.result = obj.result;
	} else {
	    this.from = "";
	    this.bet = "";
	    this.result = "";

	}
};

var Plays = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.data = obj.data;
		this.quantity = obj.quantity;
	
	} else {
	    this.data = "";
	    this.quantity = new BigNumber(0); ;


	}
};

var DepositeContent = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.balance = new BigNumber(o.balance);
	} else {
		this.balance = new BigNumber(0);
	}
};

DepositeContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BankVaultContract = function () {
/*	LocalContractStorage.defineMapProperty(this, "", {
		parse: function (text) {
			return new Plays(text);
		},
		stringify: function (o) {
			return o.toString();
		}
	//});*/
	 LocalContractStorage.defineMapProperty(this, "amount");
};

// save value to contract, only after height of block, users can takeout
BankVaultContract.prototype = {
	init: function () {
	    var from = Blockchain.transaction.from;
	    LocalContractStorage.put("admin", from);
		var deposit = new DepositeContent();
		LocalContractStorage.put("vault", deposit);
	},
	play: function () {
	    var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var bet ;
		var remainder = 0;
		if (value.gt(100000000000000000)) { // 0.1 NAS
          bet = new BigNumber(100000000000000000);
          remainder = value.sub(bet);
		} else {
			bet = value;
		}

		var random = Math.floor(Math.random() * 100) + 1;
        var deposit = LocalContractStorage.get("vault");
        deposit.balance =  new BigNumber(deposit.balance);
        var toSend = new BigNumber(0);
        var history = new History();
         history.from = from;
         history.bet = bet.sub(100000000000000000);
         this.data();
         if (bet.plus(bet).gt(deposit.balance)) throw new Error("Smart contract doesn't have enough mooney");
		if (random <=51) {
		   toSend = bet.plus(bet);

		    deposit.balance = deposit.balance.sub(bet);
		    toSend = toSend.plus(remainder);
			var result =Blockchain.transfer(from, toSend);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }
              history.result = "Win";
              var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);
			return "Your chance " + random + "you win " + bet.plus(bet) ;	
		} 

	    else { 
	      toSend = toSend.plus(remainder);
	       var result =Blockchain.transfer(from, toSend);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }

		  deposit.balance = deposit.balance.plus(bet);
		  LocalContractStorage.set("vault", deposit);
		  history.result = "Loss";
		      var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);

          return  "Your chance " +random + "you loss " + bet;
		}

	},
	playHard: function () {
	    var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var bet ;
		var remainder = 0;
		if (value.gt(100000000000000000)) { // 0.1 NAS
          bet = new BigNumber(100000000000000000);
          remainder = value.sub(bet);
		} else {
			bet = value;
		}

		var random = Math.floor(Math.random() * 100) + 1;
        var deposit = LocalContractStorage.get("vault");
        deposit.balance =  new BigNumber(deposit.balance);
        var toSend = new BigNumber(0);
        var history = new History();
         history.from = from;
         history.bet = bet;
          if (bet.plus(bet).gt(deposit.balance)) throw new Error("Smart contract doesn't have enough mooney"); 
		if (random <=48) {
		   toSend = bet.plus(bet);	
		    deposit.balance = deposit.balance.sub(bet);
		    toSend = toSend.plus(remainder);
			var result =Blockchain.transfer(from, toSend);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }
              history.result = "Win";
              var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);
			return "Your chance " + random + "you win " + bet.plus(bet) ;	
		} 

	    else { 
	      toSend = toSend.plus(remainder);
	       var result =Blockchain.transfer(from, toSend);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }

		  deposit.balance = deposit.balance.plus(bet);
		  LocalContractStorage.set("vault", deposit);
		  history.result = "Loss";
		      var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);

          return  "Your chance " +random + "you loss " + bet;
		}

	},
	data: function () {
   var from = Blockchain.transaction.from;
   var currentTime = new Date();
   var day = currentTime.getDate();
   var plays = this.amount.get(from);
   var k = "fist";
        	 if (!plays){
         	   
         	 var plays = new Plays();
              plays.data = day;
		     plays.quantity = new BigNumber(1);
                 k = "tut";  
        	} else {
        		
        		k = "second"; 
            			  if (day == plays.data) {
 							plays.quantity = new BigNumber(plays.quantity);
 							if (plays.quantity.gte(5)) {
 								 throw new Error("You can play only 5 game per day");
 						 	}
                         plays.quantity = plays.quantity.plus(1);
 						  
 				 
 					
             		 } else {
                            plays.data = day;
                            plays.quantity = new BigNumber(0);
                             k = "four"; 
                       }
               }

        	
        this.amount.put(from, plays);
     return plays.quantity;
    },
   readdata: function () {
     var from = Blockchain.transaction.from;
     var plays = this.amount.get(from);
     if (!plays){
       throw new Error("You dont have any game");
        } 
     return plays;
    },
    read: function () {
     var from = Blockchain.transaction.from;
     var arr = LocalContractStorage.get(from);
     if (!arr || arr.length == 0){
           throw new Error("You dont have any game");
          } 
     return arr;
    },
    
	save: function () {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var deposit = LocalContractStorage.get("vault");

		deposit.balance = value.plus(deposit.balance); 
		LocalContractStorage.set("vault", deposit);
		return deposit.balance;
	},

	takeout: function (value) {
		var from = Blockchain.transaction.from;
		var admin = LocalContractStorage.get("admin");
		if(admin !== from) throw new Error("You are not admin");
		var amount = new BigNumber(value);
        var deposit = LocalContractStorage.get("vault"); 
		if (amount.gt(deposit.balance)) {
			throw new Error("Insufficient balance.");
		}

		var result = Blockchain.transfer(from, amount);
		if (!result) {
			throw new Error("transfer failed.");
		}
		Event.Trigger("BankVault", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: from,
				value: amount.toString()
			}
		});
        deposit.balance =  new BigNumber(deposit.balance);
		deposit.balance = deposit.balance.sub(amount);
		LocalContractStorage.set("vault", deposit);//
		return deposit.balance;
	},
	balanceOf: function () {
		var deposit = LocalContractStorage.get("vault");
		
		return deposit.balance; 
	},
	
};
module.exports = BankVaultContract;