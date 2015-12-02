window.onload = function(){ //program contianer function


  //------------------------------------------
  //-----------DEFINE VARIABLES---------------
  //------------------------------------------
  var turn;
  var pTotalHP = 0; eTotalHP = 0;
  var timer = 4000; //control difficulty by adjusting this

  enemyArray = [];
  playerArray = [];
  

  //------------------------------------------
  //---------GAME FUNCTIONALITY---------------
  //------------------------------------------
  //Setup game based on random seed--------------------------
      function setup() {
            $('#command').text("BATTLE ON WAYNE!");
            effectAdd($('#command'), '', 'bounce', 5000);//add effect


            genCard(); //GENERATE STATS AND CARDS HERE

            var rnd = randomNumGen(1,1000); //GENERATE RANDOM START

            if(rnd%2===0)
            {
              turn = false; //false is for the computers turn
              $('#pAttack').prop("disabled",true);//disable player's ability to attack
              setTimeout(function(){ attack(); }, timer );
            } else { //...we wait for player to click
              $('#pAttack').prop("disabled",false);
              turn = true;
            }

            setTimeout(function(){ $('#command').text(""); }, timer);
       };



       //---------------------------------------------------------------------
       //ATTACK---------------------------------------------------------ATTACK
       //---------------------------------------------------------------------
       function attack(){

            if(turn)//Chose who attacks based on turn
            {
              var card = pickCard('player');
            } else {
              var card = pickCard('enemy');
            }

            effectAdd($(card).find('.effect'), 'high-light', 'slideToggle', 700,'Attack!');//add effect
            var action = $(card).find('.action').val(); //see what action the player chose
            doAttack(card, action);//Preform actual attack

            if(turn){
              $('#pAttack').prop("disabled",true);//disable player's ability to attack since we already clicked attack
              turn = false; //switch to computer's turn
              
              setTimeout(function() {
                attack();//let computer attack in seconds based on timer
              }, timer );
            
            } else {

                turn = true;//switch turns
                setTimeout(function() {
                    $('#pAttack').prop("disabled",false);//re-enable player's ability to attack
                }, timer );
            
            }
          
       };


  //Preforms the actual attack
    function doAttack(card, action) {
        //card -> The card preforming the attack
        //eff -> The card effected by the attack
          switch(action)
            {
                case 'melee':
                          //get a damage number based on the selected player's card strength
                          var pStr = $(card).find('.str').text();//grab the card's strength
                          var baseDamage = randomNumGen(pStr*2, pStr);
                          console.log('baseDamage: ', baseDamage)

                          if(turn)//Chose who to attack based on turn
                          {
                            var eff = pickCard('enemy');
                          } else {
                            var eff = pickCard('player');
                          }

                          //get that card's health and defense
                          var cardHP = $(eff).find('.hp').text();
                          var cardDef = $(eff).find('.def').text();
                          
                          baseDamage -= cardDef; //Then subtract the defense from our attack
                          
                          //Make sure it doesn't go below 0 and if it does call it a miss
                          if(baseDamage < 0) { baseDamage = 0; } 
                          
                          cardHP -= baseDamage; //Subtract that from the card's health

                          //Test to see if a card was destroyed
                          if(cardHP <= 0){
                                //Remove the card from the array immediately so we don't use the it again.
                                if(turn)
                                {
                                  var index = enemyArray.indexOf(eff);
                                  if (index > -1) { enemyArray.splice(index, 1); }
                                } else {
                                  var index = playerArray.indexOf(eff);
                                  if (index > -1) { playerArray.splice(index, 1); }
                                }
                                //Then remove the card
                                effectAdd($(eff).find('.effect'), 'basic-slash', 'slideToggle', 2000, baseDamage);
                                setTimeout(function(){ removeCard(eff); }, 2100 );
                               
                          } else { //we just attack
                            $(eff).find('.hp').text(cardHP); //set text of the effected card
                            setTimeout(function() {
                              effectAdd($(eff).find('.effect'), 'basic-slash', 'slideToggle', 2000, baseDamage);
                            }, 1000 );
                             
                          }

                      break;
                case 'magic':
                      break;
                case 'defend':
                      break;
                default:
                      console.log("Action was uneffective");

            }//End switch

    }; //END FUNCTION



    //END OUR GAME BY POSTING THE WINNER IN THE COMMAND AREA
    function endGame(message){
      $('#pAttack').prop("disabled",true);//disable player's ability to attack since we already clicked attack
      $('#command').text(message);
    };





//------------------------------------------
//------------CLICK FUNCTIONS---------------
//------------------------------------------
    $('#pAttack').on('click', function(){
        if(turn){ //double check turn
            attack(turn);
        }
    });


    
    //RANDOMLY SELECTS A CARD DEPENDING ON TEAM
    function pickCard(whatTeam) {  
      if(whatTeam === 'player')
      {
        var pickedCard = playerArray[ Math.floor(Math.random()*playerArray.length) ];
        return pickedCard;
      } else {
        var pickedCard = enemyArray[Math.floor(Math.random()*enemyArray.length)];
        return pickedCard;
      }
    };

    //CARD IS ALREADY REMOVED FROM ARRAY SO WE JUST TAKE CARE OF ANIMATIONS
    //AND REMOVING THE CARD FROM THE PARENT ELEMENT HERE
    function removeCard(card){
          effectAdd($(card), '', 'explode', 3000);
            setTimeout(function() { $(card).children().remove(); }, 2000 );

            if(playerArray.length <= 0) { endGame('Bwahahahaha! You Lose!'); }
            if(enemyArray.length <= 0) { endGame('Victory is sweet!')}//Need some mortal kombat voice over here
    };
  



    //GENERATE CARDS-------------------------------------------------------GEN CARD-----
    function genCard() {

       //ajax call
          $.ajax({
              method: "GET",
              url: 'js/karta.json',
              success: function(info) { //SUCCESS
                var player = true;
                //IF SUCCESS BUILD PLAYER CARDS
                for(var i = 0; i < 6; i++)//hard code 6(index 5), so each person gets 3 cards
                {
                    var pickedCard = randomNumGen(info['cards'].length,0);
                    var cardInfo = info['cards'][pickedCard];
                    if (i >= 3){ player = false };
                    buildPlayerCards(cardInfo, player);//Break this up so we can differenciate between player and computer
                }

              },
              error: function(err){ //FAILED
                console.log("FAIL")
                console.log(err)
              }
          });
    };


    //Builds card for HTML/CSS
    function buildPlayerCards(cardInfo, player){
            var card = document.createElement('div'); //make main div which is our card
                  //Set Card properties
                  card.className = 'card';
                  //card.setAttribute('draggable', 'true');
                  //card.setAttribute('ondragstart','drag(event)');
            //Effects      
            var effect = document.createElement('div'); //this is where our effects will display
                  effect.className = 'effect';
                  card.appendChild(effect); //attach to our card node
            //Name
            var cardName = document.createElement('h4');
                  cardName.innerHTML = cardInfo.name;
                  card.appendChild(cardName);
            //Image
            var cardImage = document.createElement('div');
                  cardImage.className = 'cardImg';
                  cardImage.style.backgroundImage = "url('"+cardInfo.url+"')";
                  card.appendChild(cardImage);
            //Action Buttons
            var action = document.createElement('select');
                  action.className = 'action';
                  if(!player) { action.setAttribute('disabled','true'); }
                  var optA = document.createElement('option');
                      optA.innerHTML = 'Melee';
                      optA.setAttribute('value', 'melee');
                      action.appendChild(optA);
                  var optB = document.createElement('option');
                      optB.innerHTML = 'Magic';
                      optB.setAttribute('value', 'magic');
                      action.appendChild(optB);
                  var optC = document.createElement('option');
                      optC.innerHTML = 'Defend';
                      optC.setAttribute('value', 'defend');
                      action.appendChild(optC);
                  card.appendChild(action);
            //badges
            var badgeHolder = document.createElement('div');
                  badgeHolder.className = 'badge';

                  //individual badges
                  var assign = document.createElement('span');
                      assign.className = 'hp';
                      assign.innerHTML = cardInfo.hp;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'mana';
                      assign.innerHTML = cardInfo.mana;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'str dNone';
                      assign.innerHTML = cardInfo.str;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'def dNone';
                      assign.innerHTML = cardInfo.def;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'fire dNone';
                      assign.innerHTML = cardInfo.def;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'water dNone';
                      assign.innerHTML = cardInfo.def;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'air dNone';
                      assign.innerHTML = cardInfo.def;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'earth dNone';
                      assign.innerHTML = cardInfo.def;
                      badgeHolder.appendChild(assign);
                  assign = document.createElement('span');
                      assign.className = 'effect dNone';
                      assign.innerHTML = cardInfo.def;
                      badgeHolder.appendChild(assign);

                  card.appendChild(badgeHolder);


            //Card is built, now attach it to an empty card holder div
            if (player) {
                //Player
                if( $('.p1').children().length < 1) {
                    p1Health = cardInfo.hp; //set this initially
                    pTotalHP += p1Health;
                    p1Mana = cardInfo.mana;
                    $('.p1').append(card);
                    playerArray.push('.p1');
                } else if ( $('.p2').children().length < 1){
                    p2Health = cardInfo.hp;
                    pTotalHP += p1Health;
                    p2Mana = cardInfo.mana;
                    $('.p2').append(card);
                    playerArray.push('.p2');
                } else if ( $('.p3').children().length < 1){
                    p3Health = cardInfo.hp;
                    pTotalHP += p1Health;
                    p3Mana = cardInfo.mana;
                    $('.p3').append(card);
                    playerArray.push('.p3');
                }
            } else {
              //Computer
              if( $('.e1').children().length < 1) {
                    p1Health = cardInfo.hp; //set this initially
                    eTotalHP += p1Health;
                    p1Mana = cardInfo.mana;
                    $('.e1').append(card);
                    enemyArray.push('.e1');
                } else if ( $('.e2').children().length < 1){
                    p2Health = cardInfo.hp;
                    eTotalHP += p1Health;
                    p2Mana = cardInfo.mana;
                    $('.e2').append(card);
                    enemyArray.push('.e2');
                } else if ( $('.e3').children().length < 1){
                    p3Health = cardInfo.hp;
                    eTotalHP += p1Health;
                    p3Mana = cardInfo.mana;
                    $('.e3').append(card);
                    enemyArray.push('.e3');
                }

            }

            //Keep for making JSON file... woot... make one of these neat function with node.js when I get time.
            //console.log( JSON.stringify());//End JSON.stringify

    };//End of create player




//------------------------------------------
//-----------HELPER FUNCTIONS---------------
//------------------------------------------

    //Random Number Generator--------------------------------------
    function randomNumGen(min,max){
        return Math.floor(Math.random() * (max - min) + min);
    };


    //ADD OUR EFFECTS FOR ATTACKS-----------------------------------------ADD EFFECT*/
    function effectAdd(target, effectClass, effect, time, baseDamage) {
        if(effectClass != undefined){
            $(target).addClass(effectClass);
        }
        $( target ).effect( effect );
        if(baseDamage <= 0 ){baseDamage = 'Missed!'};
        $( target ).text( baseDamage );
        clearEffect(target, effectClass, time);
    };
    //Callback to clear Effect after adding it.
    function clearEffect(target, effectClass, time) {
      setTimeout(function() {
          $( target ).removeClass( effectClass );
          $( target ).text( '' );

      }, time );
    };



//--------------------GAME START--------------------------
function controller(){
  if(turn === undefined){ //test to see if we've started game and if not turn is undefined so we start
    setup(); 
  } 
};

controller(); //we call this first which basically determines if a game is in play and if not, we do a 
//random start


}(); /* END OF PROGRAM FUNCTION */












/*END OF FILE*/