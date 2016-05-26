//5/18/2016 - Author Clyde Barretto
//5/19/2016 - Modified to make it more modular with better testing

/*Scoring Logic

Ref https://github.com/EITC-IRPD/splits-happen

Each game, or "line" of bowling, includes ten turns, or "frames" for the bowler.
In each frame, the bowler gets up to two tries to knock down all the pins.
If in two tries, he fails to knock them all down, his score for that frame is the total number of pins knocked down in his two tries.
If in two tries he knocks them all down, this is called a "spare" and his score for the frame is ten plus the number of pins knocked down on his next throw (in his next turn).
If on his first try in the frame he knocks down all the pins, this is called a "strike". His turn is over, and his score for the frame is ten plus the simple total of the pins knocked down in his next two rolls.
If he gets a spare or strike in the last (tenth) frame, the bowler gets to throw one or two more bonus balls, respectively. These bonus throws are taken as part of the same turn. If the bonus throws knock down all the pins, the process does not repeat: the bonus throws are only used to calculate the score of the final frame.
The game score is the total of all frame scores. 

Sample Data 
XXXXXXXXXXXX
9-9-9-9-9-9-9-9-9-9-
5/5/5/5/5/5/5/5/5/5/5
X7/9-X-88/-6XXX81

 */	


(function() {

	ng.core.enableProdMode(); //Enable Angular 2 Production Mode

	//Init and setup all Angular 2 references 
	//SETUP  Template
	var HelloApp = 
    ng.core
    .Component({
      selector: 'hello-app',
      template: `
	   
	  <div class="panel panel-primary">
		<div class="panel-heading"><h1>Welcome to Split Happens 2016 - V2!</h1></div>
		<div class="panel-info"><i>Written using Bootstrap + Angular 2 + Javascript</i></div>
		<div class="panel-body">
		  <table class="table "  >  	  
			  <tr>
				<td class="col-md-1"><span class="label label-default">Please enter your input here </span></td>
				<td class="col-md-3"><input id="myValueNow" type="text" #myInputElement value="" (keyup)="0">
					<span [style.visibility]="myInputElement.value != ''? 'hidden' : 'visible' ">No input yet!</span>
				</td>
				<td class="col-md-6"></td>
			  </tr>
			  <tr>
				<td class="col-md-1"><span class="label label-default">Length</span></td>
				<td class="col-md-3">{{myInputElement.value.length}}</td>
				<td class="col-md-6"></td>
			  </tr>
		  </table>
		</div>

	</div>
	
	<button (click)="showScore(myInputElement)" [disabled]="myInputElement.value==''" class="btn btn-primary">Calculate Score</button>
	
	
	
	 `
    })
    .Class({
      constructor: function() {	  
		this.message="Calculate Score"; 
		this.dataToProcess=""; 
		this.score=0; //init score
		this.programInputArray = []; //Used to store elements 1-12

		this.myAction = function(){
			alert(this.message);
		}

		this.showScore = function(myInputElement){
			console.log('Show Score method');


			this.score=0; //init score
			//Sanitize string first
			this.dataToProcess=myInputElement.value; //set value to process
			
			if(this.dataToProcess.trim().length==0){alert("Please enter proper characters!"); return 0;} //If Invalid chars stop processing

			this.dataToProcess = this.dataToProcess.trim(); //trim spaces
			this.dataToProcess = this.dataToProcess.toUpperCase(); //Convert to upper case
			this.dataToProcess = this.dataToProcess.replace(/\//g, "F"); //Sanitize forward slashes - Using F for forward slash
			this.Process(); //Process Data
			
			if(this.score>0){alert("Your score of " + this.score + " is great!");}
		}

		this.Process = function(){		
			localScore = 0; //this is a local variable to track score because we do not want to update the main score var all the time			
			
			if(this.dataToProcess.trim().length==0){alert("Please enter proper characters!"); return 0;} //If Invalid chars stop processing

			//Ingest Input and put it into arrays
			
			//STEP 1 - Init Array
			this.Init();
			
			//STEP 2 - Fill Array					
			ret=this.FillArray();
			
			if(ret==-1){alert("Invalid Characters"); return 0;} //If Invalid chars stop processing

			//STEP 3 - Score Arrays - process 1-9 then process other bonuses	
			this.ScoreArray();

		}

		this.Init = function(){		
			//Init Program Array 
			this.programInputArray = []
 			for (i = 0; i < 12; i++) {
				this.programInputArray.push("");
			}	 
		}


		this.ScoreArray = function(){			
			//Init Program Array 
			
			TotalScoreData = 0; //temp score data
			throwData = ""; //This represents one TURN (Which can include 2 rolls)
			tempHoldingVar = 0;
			
 			for (i = 0; i < 10; i++) {
				arrayScoreData = 0; //temp score data
				tempHoldingVar = 0;
				throwData = "";
				
				throwData = this.programInputArray[i];
								
				if (throwData=="X") //If current
				{
					arrayScoreData = arrayScoreData + 10;	
					
					//First character after X
					if(this.programInputArray[i+1].length > 0 	) //Changing to execute only if rolls are present
					{
						tempHoldingVar = this.evalScoreForCharacter(this.programInputArray[i+1][0]);
						
						arrayScoreData = arrayScoreData + tempHoldingVar;

						//Code not to process last pins as multiple
						if(i<9 ) {
							if(this.programInputArray[i+1].length > 1) //That means there is a 3'd pin
							{
								//That means it is a regular 2'nd pin
								if(this.programInputArray[i+1][1]=="F")
								{
									arrayScoreData = arrayScoreData + (10 - tempHoldingVar);								
								}
								else
								{
									arrayScoreData = arrayScoreData + this.evalScoreForCharacter(this.programInputArray[i+1]);
								}
							}
							else
							{
								if(this.programInputArray[i+2].length > 0)
								{
									arrayScoreData = arrayScoreData + this.evalScoreForCharacter(this.programInputArray[i+2]);
								}
							}
						}
						else
						{
							if(this.programInputArray[i+2].length > 0)
							{
								arrayScoreData = arrayScoreData + this.evalScoreForCharacter(this.programInputArray[i+1]);
							}
						}
					}
					
				}
				else if (throwData.indexOf("F")>=0) //If current
				{
					arrayScoreData = arrayScoreData + 10;	
					//Eval next 1 rols data
					//ONLY take score of first roll

					tempHoldingVar = this.evalScoreForCharacter(this.programInputArray[i+1][0]);
					arrayScoreData = arrayScoreData + tempHoldingVar;
				}
				else 
				{
					tempHoldingVar = this.evalScoreForCharacter(throwData);
					arrayScoreData = arrayScoreData + tempHoldingVar;									
				}
				

				TotalScoreData = TotalScoreData + arrayScoreData;
			}
						
			this.score=TotalScoreData;
		}

		this.evalScoreForCharacter = function(throwInfo){
			if (throwInfo=='X' || throwInfo.indexOf("F")>0) 
			{
				// / score = 10 if any / present
				return 10; 
			}
			else 
			{
				// / This means there are only pins left
				//eliminate - from throw data to get pure number
				digitsOnlyData=throwInfo.replace(/-/g, "");				
				return this.SumDigits(Number(digitsOnlyData));
			}
		}

		this.SumDigits = function(digitInfo){
			//this function adds digits in the rolls
			digitSum = 0;
			var s = String(digitInfo);
			for ( var i = 0; i < s.length; i++ )
			{
				digitSum = digitSum + Number(s.charAt(i));
			}
			return digitSum;
		}
		
		this.FillArray = function(){			
			//Fill Array with values from input
			intStringPointer = 0; //keeps track of where the string pointer is
			lenOriginalString = this.dataToProcess.length; //capture original string length
			intArrayPointer = 0; //Array pointer where stuff rolls for port processing
			
			characterToProcess = ""; //Holds Current character being processed
			characterToProcessNext = ""; //Holds Next character being processed

			while (intStringPointer < lenOriginalString )
			{
				characterToProcess = ""; //clean variable just in case (may not be needed in future)
				characterToProcessNext = ""; //clean variable just in case (may not be needed in future)
				
				characterToProcess = this.dataToProcess.substring(intStringPointer, intStringPointer+1);				
				characterToProcessNext = this.dataToProcess.substring(intStringPointer+1, intStringPointer+2);				
				//Check for invalid char
				if("123456789X-F".indexOf(characterToProcess)==-1) {					
					return -1;
				}
		
				this.programInputArray[intArrayPointer]=characterToProcess;				
				if(characterToProcess!='X')
				{
					this.programInputArray[intArrayPointer]=characterToProcess + characterToProcessNext;
					intStringPointer = intStringPointer + 2; //also move pointer ahead cos we are pre processing  if no X					
				}
				else
				{
					intStringPointer = intStringPointer + 1; //also move pointer ahead cos we are pre processing  if no X
				}
				
				intArrayPointer++;
				
			}				
			
			return 0;
		}
		
	  }  

    }
	
	);

  document.addEventListener('DOMContentLoaded', function() {
    ng.platform.browser.bootstrap(HelloApp);
  });

})();

