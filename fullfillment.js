// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

//http://melee.theshoemaker.de/?dir=framedata-json

var obj = "";

var character = "";
var foxFlag = false;
var falcoFlag = false;

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to the frame data app. Name a character you want to hear about`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function shieldAdv(hitF,hitBD,totF,aerialFlag){
    var frameAdv;
    if (hitBD == 1 || hitBD == 2){
        frameAdv = 2;
    }
    else if (hitBD == 3 || hitBD == 4){
        frameAdv = 3;
    }
    else if (hitBD == 5 || hitBD == 6){
        frameAdv = 4;
    }
    else if (hitBD == 7 || hitBD == 8){
        frameAdv = 5;
    }
    else if (hitBD == 9 || hitBD == 10 || hitBD == 11){
        frameAdv = 6;
    }
    else if (hitBD == 12 || hitBD == 13){
        frameAdv = 7;
    }
    else if (hitBD == 14 || hitBD == 15){
        frameAdv = 8;
    }
    else if (hitBD == 16 || hitBD == 17){
        frameAdv = 9;
    }
    else if (hitBD == 18 || hitBD == 19 || hitBD == 20){
        frameAdv = 10;
    }
    else if (hitBD == 21 || hitBD == 22){
        frameAdv = 11;
    }
    else if (hitBD == 23 || hitBD == 24){
        frameAdv = 12;
    }
    else if (hitBD == 25 || hitBD == 26){
        frameAdv = 13;
    }
    else if (hitBD == 27 || hitBD == 28 || hitBD == 29){
        frameAdv = 14;
    }
    else if (hitBD == 30 || hitBD == 31){
        frameAdv = 15;
    }
    else if (hitBD == 32 || hitBD == 33){
        frameAdv = 16;
    }
    else if (hitBD == 34 || hitBD == 35){
        frameAdv = 17;
    }
    else if (hitBD == 36){
        frameAdv = 18;
    }

    var finalAdv;
    if(aerialFlag === true) {
        console.log("aerial advantage case entered");
        finalAdv = frameAdv - totF;
    }
    else {
        finalAdv = (hitF + frameAdv) - totF;
    }
    // console.log("Frame advantage is: " + finalAdv);
    return finalAdv;

}

function getMove(character,start,move){
    console.log(obj);
    //var start = obj.dashattack;
    var totFNormal = start.totalFrames;
    var totFIasa = start.iasa;
    var totF;
    // console.log("Total frames normal: " + totFNormal);
    // console.log("Total frames iasa: " + totFIasa);
    if (totFIasa === null || totFIasa === undefined){
        totF = totFNormal;
    }
    else {
        totF = totFIasa;
    }

    var aerialFlag = false;
    if (move === "neutral air" || move === "forward air" || move === "back air" || move === "up air" || move === "down air" ) {
        totF = start.lcancelledLandingLag;
        aerialFlag = true;
        console.log("aerial flag if statement entered");
    }
    var hitF = start.hitFrames;
    console.log(start);
    console.log(hitF);
    var hitFS;
    var hitFE;
    var hitBD;
    var advantage;
    var advantageS;

    if(hitF.length > 1) {
        var constructedString = (character + "'s " + move + " has " + hitF.length + " hitboxes." + " One is active on frame ");
        for (var i = 0; i < hitF.length; i++){
            //var temp = [];
            hitFS = start.hitFrames[i].start;
            constructedString += (hitFS + " to ");
            //temp.add(hitFS);
            hitFE = start.hitFrames[i].end;
            //temp.add(hitFE);
            constructedString += (hitFE + ".");
            hitBD = start.hitboxes[i].damage;
            constructedString += (" Doing " + hitBD + " damage.");
            //temp.add(hitBD);
            //console.log(temp);
            //multiHit.add(temp);
            if (i == hitF.length - 1){
                continue;
            }
            else {
                constructedString += (" The next is active on frame ");
            }

        }
        console.log("First hitbox start: " + start.hitFrames[0].start);
        console.log("First hitbox dmg: " + start.hitboxes[0].damage);
        console.log("Total frames: " + totF);
        advantage = shieldAdv(start.hitFrames[0].start,start.hitboxes[0].damage,totF,aerialFlag);
        if (advantage > 0) {
            advantageS = (" plus " + advantage);
        }
        else {
            advantageS = (" minus " + Math.abs(advantage));
        }
        constructedString += (" The move is " + advantageS + " on shield.");
        agent.add(constructedString);
    }
    else {
        hitFS = start.hitFrames[0].start;
        hitFE = start.hitFrames[0].end;
        hitBD = start.hitboxes[0].damage;
        advantage = shieldAdv(hitFS,hitBD,totF,aerialFlag);
        if (advantage > 0) {
            advantageS = (" plus " + advantage);
        }
        else {
            advantageS = (" minus " + Math.abs(advantage));
        }
        agent.add(character + "'s " + move + " is active on frame " + hitFS + " to " + hitFE + "." + " It does " + hitBD + " damage." + " The move is " + advantageS + " on shield.");

    }
    // console.log("Refactoring succesfull!!");
}


   // Uncomment and edit to make your own Google Assistant intent handler
   // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
   // below to get this function to be run when a Dialogflow intent is matched
    function setFox(agent) {
        agent.add("What move do you want to hear about?");
        var fox_data = ('{"jab1":{"subactionIndex":46,"subactionName":"PlyFox5K_Share_ACTION_Attack11_figatree","totalFrames":17,"iasa":16,"hitFrames":[{"start":2,"end":3,"hitboxes":[0]}],"hitboxes":[{"damage":4,"angle":70,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"jab2":{"subactionIndex":47,"subactionName":"PlyFox5K_Share_ACTION_Attack12_figatree","totalFrames":19,"iasa":18,"hitFrames":[{"start":2,"end":3,"hitboxes":[0]}],"hitboxes":[{"damage":4,"angle":70,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"jab3":null,"rapidjabs_start":{"subactionIndex":49,"subactionName":"PlyFox5K_Share_ACTION_Attack100Start_figatree","totalFrames":6,"iasa":null,"hitFrames":[],"hitboxes":[]},"rapidjabs_loop":{"subactionIndex":50,"subactionName":"PlyFox5K_Share_ACTION_Attack100Loop_figatree","totalFrames":35,"iasa":null,"hitFrames":[{"start":2,"end":3,"hitboxes":[0]}],"hitboxes":[{"damage":1,"angle":78,"kbGrowth":80,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"rapidjabs_end":{"subactionIndex":51,"subactionName":"PlyFox5K_Share_ACTION_Attack100End_figatree","totalFrames":8,"iasa":null,"hitFrames":[],"hitboxes":[]},"dashattack":{"subactionIndex":52,"subactionName":"PlyFox5K_Share_ACTION_AttackDash_figatree","totalFrames":39,"iasa":36,"hitFrames":[{"start":4,"end":7,"hitboxes":[0]},{"start":8,"end":17,"hitboxes":[1]}],"hitboxes":[{"damage":7,"angle":72,"kbGrowth":90,"weightDepKb":0,"hitboxInteraction":3,"baseKb":35,"element":"normal","shieldDamage":1,"hitGrounded":true,"hitAirborne":true},{"damage":5,"angle":72,"kbGrowth":90,"weightDepKb":0,"hitboxInteraction":3,"baseKb":20,"element":"normal","shieldDamage":1,"hitGrounded":true,"hitAirborne":true}]},"ftilt_h":{"subactionIndex":53,"subactionName":"PlyFox5K_Share_ACTION_AttackS3Hi_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":8,"hitboxes":[0,1]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":1,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_mh":{"subactionIndex":54,"subactionName":"PlyFox5K_Share_ACTION_AttackS3HiS_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":8,"hitboxes":[0,1]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":1,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_m":{"subactionIndex":55,"subactionName":"PlyFox5K_Share_ACTION_AttackS3S_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":8,"hitboxes":[0,1]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":1,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_ml":{"subactionIndex":56,"subactionName":"PlyFox5K_Share_ACTION_AttackS3LwS_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":8,"hitboxes":[0,1]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":1,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_l":{"subactionIndex":57,"subactionName":"PlyFox5K_Share_ACTION_AttackS3Lw_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":8,"hitboxes":[0,1]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":1,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"utilt":{"subactionIndex":58,"subactionName":"PlyFox5K_Share_ACTION_AttackHi3_figatree","totalFrames":23,"iasa":23,"hitFrames":[{"start":5,"end":11,"hitboxes":[0,1,2]}],"hitboxes":[{"damage":12,"angle":110,"kbGrowth":140,"weightDepKb":0,"hitboxInteraction":3,"baseKb":18,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":false},{"damage":9,"angle":84,"kbGrowth":140,"weightDepKb":0,"hitboxInteraction":3,"baseKb":18,"element":"normal","shieldDamage":0,"hitGrounded":false,"hitAirborne":true},{"damage":9,"angle":80,"kbGrowth":140,"weightDepKb":0,"hitboxInteraction":3,"baseKb":18,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dtilt":{"subactionIndex":59,"subactionName":"PlyFox5K_Share_ACTION_AttackLw3_figatree","totalFrames":29,"iasa":28,"hitFrames":[{"start":7,"end":9,"hitboxes":[0,1,2]}],"hitboxes":[{"damage":10,"angle":70,"kbGrowth":125,"weightDepKb":0,"hitboxInteraction":3,"baseKb":25,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":10,"angle":80,"kbGrowth":125,"weightDepKb":0,"hitboxInteraction":3,"baseKb":25,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":10,"angle":90,"kbGrowth":125,"weightDepKb":0,"hitboxInteraction":3,"baseKb":25,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fsmash_h":null,"fsmash_mh":null,"fsmash_m":{"subactionIndex":62,"subactionName":"PlyFox5K_Share_ACTION_AttackS4_figatree","totalFrames":39,"chargeFrame":7,"iasa":null,"hitFrames":[{"start":12,"end":16,"hitboxes":[0]},{"start":17,"end":22,"hitboxes":[1]}],"hitboxes":[{"damage":15,"angle":361,"kbGrowth":105,"weightDepKb":0,"hitboxInteraction":2,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":12,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":2,"baseKb":2,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fsmash_ml":null,"fsmash_l":null,"usmash":{"subactionIndex":66,"subactionName":"PlyFox5K_Share_ACTION_AttackHi4_figatree","totalFrames":41,"chargeFrame":2,"iasa":null,"hitFrames":[{"start":7,"end":9,"hitboxes":[0]},{"start":10,"end":17,"hitboxes":[1]}],"hitboxes":[{"damage":18,"angle":80,"kbGrowth":112,"weightDepKb":0,"hitboxInteraction":3,"baseKb":30,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":13,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dsmash":{"subactionIndex":67,"subactionName":"PlyFox5K_Share_ACTION_AttackLw4_figatree","totalFrames":49,"chargeFrame":2,"iasa":46,"hitFrames":[{"start":6,"end":10,"hitboxes":[0,1]}],"hitboxes":[{"damage":15,"angle":25,"kbGrowth":65,"weightDepKb":0,"hitboxInteraction":3,"baseKb":20,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":12,"angle":361,"kbGrowth":65,"weightDepKb":0,"hitboxInteraction":3,"baseKb":20,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"nair":{"subactionIndex":68,"subactionName":"PlyFox5K_Share_ACTION_AttackAirN_figatree","totalFrames":49,"iasa":42,"autoCancelBefore":4,"autoCancelAfter":36,"landingLag":15,"lcancelledLandingLag":7,"hitFrames":[{"start":4,"end":7,"hitboxes":[0]},{"start":8,"end":31,"hitboxes":[1]}],"hitboxes":[{"damage":12,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fair":{"subactionIndex":69,"subactionName":"PlyFox5K_Share_ACTION_AttackAirF_figatree","totalFrames":59,"iasa":53,"autoCancelBefore":6,"autoCancelAfter":48,"landingLag":22,"lcancelledLandingLag":11,"hitFrames":[{"start":6,"end":8,"hitboxes":[0]},{"start":16,"end":18,"hitboxes":[1]},{"start":24,"end":26,"hitboxes":[2]},{"start":33,"end":35,"hitboxes":[3]},{"start":43,"end":45,"hitboxes":[4]}],"hitboxes":[{"damage":7,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":5,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":6,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":4,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":3,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":50,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"bair":{"subactionIndex":70,"subactionName":"PlyFox5K_Share_ACTION_AttackAirB_figatree","totalFrames":39,"iasa":38,"autoCancelBefore":4,"autoCancelAfter":22,"landingLag":20,"lcancelledLandingLag":10,"hitFrames":[{"start":4,"end":7,"hitboxes":[0,1]},{"start":8,"end":19,"hitboxes":[1]}],"hitboxes":[{"damage":15,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"uair":{"subactionIndex":71,"subactionName":"PlyFox5K_Share_ACTION_AttackAirHi_figatree","totalFrames":39,"iasa":36,"autoCancelBefore":8,"autoCancelAfter":25,"landingLag":18,"lcancelledLandingLag":9,"hitFrames":[{"start":8,"end":9,"hitboxes":[0]},{"start":11,"end":14,"hitboxes":[1]}],"hitboxes":[{"damage":5,"angle":92,"kbGrowth":120,"weightDepKb":30,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":13,"angle":85,"kbGrowth":116,"weightDepKb":0,"hitboxInteraction":3,"baseKb":40,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dair":{"subactionIndex":72,"subactionName":"PlyFox5K_Share_ACTION_AttackAirLw_figatree","totalFrames":49,"iasa":null,"autoCancelBefore":5,"autoCancelAfter":33,"landingLag":18,"lcancelledLandingLag":9,"hitFrames":[{"start":5,"end":6,"hitboxes":[0,1]},{"start":8,"end":9,"hitboxes":[0,1]},{"start":11,"end":12,"hitboxes":[0,1]},{"start":14,"end":15,"hitboxes":[0,1]},{"start":17,"end":18,"hitboxes":[0,1]},{"start":20,"end":21,"hitboxes":[0,1]},{"start":23,"end":24,"hitboxes":[0,1]},{"start":26,"end":27,"hitboxes":[0,1]}],"hitboxes":[{"damage":3,"angle":290,"kbGrowth":100,"weightDepKb":30,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":2,"angle":290,"kbGrowth":100,"weightDepKb":30,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"grab":{"subactionIndex":242,"subactionName":"PlyFox5K_Share_ACTION_Catch_figatree","totalFrames":29,"iasa":null,"hitFrames":[{"start":6,"end":7,"hitboxes":[0]}],"hitboxes":[{"damage":0,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":2,"baseKb":0,"element":"grab","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dashgrab":{"subactionIndex":243,"subactionName":"PlyFox5K_Share_ACTION_CatchDash_figatree","totalFrames":39,"iasa":null,"hitFrames":[{"start":11,"end":12,"hitboxes":[0]}],"hitboxes":[{"damage":0,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":2,"baseKb":0,"element":"grab","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"pummel":{"subactionIndex":245,"subactionName":"PlyFox5K_Share_ACTION_CatchAttack_figatree","totalFrames":23,"iasa":null,"hitFrames":[{"start":4,"end":4,"hitboxes":[0]}],"hitboxes":[{"damage":3,"angle":80,"kbGrowth":100,"weightDepKb":30,"hitboxInteraction":1,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fthrow":{"subactionIndex":247,"subactionName":"PlyFox5K_Share_ACTION_ThrowF_figatree","totalFrames":33,"iasa":null,"throw":{"damage":3,"angle":45,"kbGrowth":130,"weightDepKb":0,"baseKb":8,"element":12},"hitFrames":[{"start":10,"end":10,"hitboxes":[0]}],"hitboxes":[{"damage":4,"angle":55,"kbGrowth":100,"weightDepKb":140,"hitboxInteraction":0,"baseKb":10,"element":"normal","shieldDamage":1,"hitGrounded":true,"hitAirborne":true}]},"bthrow":{"subactionIndex":248,"subactionName":"PlyFox5K_Share_ACTION_ThrowB_figatree","totalFrames":38,"projectiles":[15,18,21],"iasa":null,"throw":{"damage":2,"angle":56,"kbGrowth":85,"weightDepKb":0,"baseKb":20,"element":0},"hitFrames":[],"hitboxes":[]},"uthrow":{"subactionIndex":249,"subactionName":"PlyFox5K_Share_ACTION_ThrowHi_figatree","totalFrames":38,"projectiles":[18,20,24],"iasa":null,"throw":{"damage":2,"angle":90,"kbGrowth":110,"weightDepKb":0,"baseKb":18,"element":12},"hitFrames":[],"hitboxes":[]},"dthrow":{"subactionIndex":250,"subactionName":"PlyFox5K_Share_ACTION_ThrowLw_figatree","totalFrames":43,"projectiles":[23,25,28,31],"iasa":null,"throw":{"damage":1,"angle":270,"kbGrowth":40,"weightDepKb":0,"baseKb":37,"element":8},"hitFrames":[],"hitboxes":[]}}');
        character = "Fox";
        obj = JSON.parse(fox_data);
        // jabHandeler(character,obj);

    }

    function setFalco(agent){
        agent.add("What move do you want to hear about?");
        var falco_data =('{"jab1":{"subactionIndex":46,"subactionName":"PlyFalco5K_Share_ACTION_Attack11_figatree","totalFrames":17,"iasa":16,"hitFrames":[{"start":2,"end":3,"hitboxes":[0]}],"hitboxes":[{"damage":4,"angle":70,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"jab2":{"subactionIndex":47,"subactionName":"PlyFalco5K_Share_ACTION_Attack12_figatree","totalFrames":19,"iasa":18,"hitFrames":[{"start":2,"end":3,"hitboxes":[0]}],"hitboxes":[{"damage":4,"angle":50,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"jab3":null,"rapidjabs_start":{"subactionIndex":49,"subactionName":"PlyFalco5K_Share_ACTION_Attack100Start_figatree","totalFrames":6,"iasa":null,"hitFrames":[],"hitboxes":[]},"rapidjabs_loop":{"subactionIndex":50,"subactionName":"PlyFalco5K_Share_ACTION_Attack100Loop_figatree","totalFrames":35,"iasa":null,"hitFrames":[{"start":2,"end":3,"hitboxes":[0]}],"hitboxes":[{"damage":1,"angle":80,"kbGrowth":80,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"rapidjabs_end":{"subactionIndex":51,"subactionName":"PlyFalco5K_Share_ACTION_Attack100End_figatree","totalFrames":8,"iasa":null,"hitFrames":[],"hitboxes":[]},"dashattack":{"subactionIndex":52,"subactionName":"PlyFalco5K_Share_ACTION_AttackDash_figatree","totalFrames":39,"iasa":36,"hitFrames":[{"start":4,"end":7,"hitboxes":[0]},{"start":8,"end":17,"hitboxes":[1]}],"hitboxes":[{"damage":9,"angle":72,"kbGrowth":90,"weightDepKb":0,"hitboxInteraction":3,"baseKb":35,"element":"normal","shieldDamage":1,"hitGrounded":true,"hitAirborne":true},{"damage":6,"angle":72,"kbGrowth":90,"weightDepKb":0,"hitboxInteraction":3,"baseKb":20,"element":"normal","shieldDamage":1,"hitGrounded":true,"hitAirborne":true}]},"ftilt_h":{"subactionIndex":53,"subactionName":"PlyFalco5K_Share_ACTION_AttackS3Hi_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":9,"hitboxes":[0]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_mh":{"subactionIndex":54,"subactionName":"PlyFalco5K_Share_ACTION_AttackS3HiS_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":9,"hitboxes":[0]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_m":{"subactionIndex":55,"subactionName":"PlyFalco5K_Share_ACTION_AttackS3S_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":9,"hitboxes":[0]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_ml":{"subactionIndex":56,"subactionName":"PlyFalco5K_Share_ACTION_AttackS3LwS_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":9,"hitboxes":[0]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"ftilt_l":{"subactionIndex":57,"subactionName":"PlyFalco5K_Share_ACTION_AttackS3Lw_figatree","totalFrames":26,"iasa":null,"hitFrames":[{"start":5,"end":9,"hitboxes":[0]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"utilt":{"subactionIndex":58,"subactionName":"PlyFalco5K_Share_ACTION_AttackHi3_figatree","totalFrames":23,"iasa":23,"hitFrames":[{"start":5,"end":11,"hitboxes":[0,1]}],"hitboxes":[{"damage":9,"angle":97,"kbGrowth":120,"weightDepKb":0,"hitboxInteraction":3,"baseKb":30,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":90,"kbGrowth":120,"weightDepKb":0,"hitboxInteraction":3,"baseKb":30,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dtilt":{"subactionIndex":59,"subactionName":"PlyFalco5K_Share_ACTION_AttackLw3_figatree","totalFrames":29,"iasa":28,"hitFrames":[{"start":7,"end":9,"hitboxes":[0]}],"hitboxes":[{"damage":13,"angle":75,"kbGrowth":125,"weightDepKb":0,"hitboxInteraction":3,"baseKb":25,"element":"slash","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fsmash_h":null,"fsmash_mh":null,"fsmash_m":{"subactionIndex":62,"subactionName":"PlyFalco5K_Share_ACTION_AttackS4_figatree","totalFrames":39,"chargeFrame":7,"iasa":null,"hitFrames":[{"start":12,"end":16,"hitboxes":[0,1]},{"start":17,"end":21,"hitboxes":[2]}],"hitboxes":[{"damage":17,"angle":361,"kbGrowth":90,"weightDepKb":0,"hitboxInteraction":2,"baseKb":40,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":17,"angle":110,"kbGrowth":90,"weightDepKb":0,"hitboxInteraction":2,"baseKb":40,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":14,"angle":361,"kbGrowth":105,"weightDepKb":0,"hitboxInteraction":2,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fsmash_ml":null,"fsmash_l":null,"usmash":{"subactionIndex":66,"subactionName":"PlyFalco5K_Share_ACTION_AttackHi4_figatree","totalFrames":43,"chargeFrame":2,"iasa":null,"hitFrames":[{"start":7,"end":10,"hitboxes":[0]},{"start":11,"end":15,"hitboxes":[1]}],"hitboxes":[{"damage":14,"angle":95,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":25,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":12,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dsmash":{"subactionIndex":67,"subactionName":"PlyFalco5K_Share_ACTION_AttackLw4_figatree","totalFrames":49,"chargeFrame":2,"iasa":46,"hitFrames":[{"start":6,"end":10,"hitboxes":[0,1]}],"hitboxes":[{"damage":16,"angle":25,"kbGrowth":70,"weightDepKb":0,"hitboxInteraction":3,"baseKb":20,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":13,"angle":80,"kbGrowth":70,"weightDepKb":0,"hitboxInteraction":3,"baseKb":20,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"nair":{"subactionIndex":68,"subactionName":"PlyFalco5K_Share_ACTION_AttackAirN_figatree","totalFrames":49,"iasa":42,"autoCancelBefore":4,"autoCancelAfter":36,"landingLag":15,"lcancelledLandingLag":7,"hitFrames":[{"start":4,"end":7,"hitboxes":[0]},{"start":8,"end":31,"hitboxes":[1]}],"hitboxes":[{"damage":12,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fair":{"subactionIndex":69,"subactionName":"PlyFalco5K_Share_ACTION_AttackAirF_figatree","totalFrames":59,"iasa":53,"autoCancelBefore":6,"autoCancelAfter":48,"landingLag":22,"lcancelledLandingLag":11,"hitFrames":[{"start":6,"end":8,"hitboxes":[0]},{"start":16,"end":18,"hitboxes":[1]},{"start":24,"end":26,"hitboxes":[2]},{"start":33,"end":35,"hitboxes":[3]},{"start":43,"end":45,"hitboxes":[4]}],"hitboxes":[{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":8,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":7,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":5,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":3,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":50,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"bair":{"subactionIndex":70,"subactionName":"PlyFalco5K_Share_ACTION_AttackAirB_figatree","totalFrames":39,"iasa":38,"autoCancelBefore":4,"autoCancelAfter":22,"landingLag":20,"lcancelledLandingLag":10,"hitFrames":[{"start":4,"end":7,"hitboxes":[0,1]},{"start":8,"end":19,"hitboxes":[1]}],"hitboxes":[{"damage":15,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"uair":{"subactionIndex":71,"subactionName":"PlyFalco5K_Share_ACTION_AttackAirHi_figatree","totalFrames":39,"iasa":36,"autoCancelBefore":8,"autoCancelAfter":25,"landingLag":18,"lcancelledLandingLag":9,"hitFrames":[{"start":8,"end":9,"hitboxes":[0,1]},{"start":11,"end":14,"hitboxes":[2,3]}],"hitboxes":[{"damage":6,"angle":90,"kbGrowth":20,"weightDepKb":0,"hitboxInteraction":1,"baseKb":40,"element":"slash","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":6,"angle":90,"kbGrowth":20,"weightDepKb":0,"hitboxInteraction":1,"baseKb":30,"element":"slash","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":10,"angle":70,"kbGrowth":120,"weightDepKb":0,"hitboxInteraction":3,"baseKb":22,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":10,"angle":90,"kbGrowth":20,"weightDepKb":0,"hitboxInteraction":1,"baseKb":30,"element":"slash","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dair":{"subactionIndex":72,"subactionName":"PlyFalco5K_Share_ACTION_AttackAirLw_figatree","totalFrames":49,"iasa":null,"autoCancelBefore":5,"autoCancelAfter":29,"landingLag":18,"lcancelledLandingLag":9,"hitFrames":[{"start":5,"end":14,"hitboxes":[0]},{"start":15,"end":24,"hitboxes":[1]}],"hitboxes":[{"damage":12,"angle":290,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":10,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true},{"damage":9,"angle":290,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":3,"baseKb":20,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"grab":{"subactionIndex":242,"subactionName":"PlyFalco5K_Share_ACTION_Catch_figatree","totalFrames":29,"iasa":null,"hitFrames":[{"start":6,"end":7,"hitboxes":[0]}],"hitboxes":[{"damage":0,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":2,"baseKb":0,"element":"grab","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"dashgrab":{"subactionIndex":243,"subactionName":"PlyFalco5K_Share_ACTION_CatchDash_figatree","totalFrames":39,"iasa":null,"hitFrames":[{"start":11,"end":12,"hitboxes":[0]}],"hitboxes":[{"damage":0,"angle":361,"kbGrowth":100,"weightDepKb":0,"hitboxInteraction":2,"baseKb":0,"element":"grab","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"pummel":{"subactionIndex":245,"subactionName":"PlyFalco5K_Share_ACTION_CatchAttack_figatree","totalFrames":23,"iasa":null,"hitFrames":[{"start":4,"end":4,"hitboxes":[0]}],"hitboxes":[{"damage":3,"angle":80,"kbGrowth":100,"weightDepKb":30,"hitboxInteraction":1,"baseKb":0,"element":"normal","shieldDamage":0,"hitGrounded":true,"hitAirborne":true}]},"fthrow":{"subactionIndex":247,"subactionName":"PlyFalco5K_Share_ACTION_ThrowF_figatree","totalFrames":33,"iasa":null,"throw":{"damage":3,"angle":45,"kbGrowth":135,"weightDepKb":0,"baseKb":8,"element":12},"hitFrames":[{"start":10,"end":10,"hitboxes":[0]}],"hitboxes":[{"damage":4,"angle":60,"kbGrowth":180,"weightDepKb":0,"hitboxInteraction":0,"baseKb":60,"element":"normal","shieldDamage":1,"hitGrounded":true,"hitAirborne":true}]},"bthrow":{"subactionIndex":248,"subactionName":"PlyFalco5K_Share_ACTION_ThrowB_figatree","totalFrames":38,"projectiles":[15,18,21],"iasa":null,"throw":{"damage":2,"angle":56,"kbGrowth":85,"weightDepKb":0,"baseKb":20,"element":0},"hitFrames":[],"hitboxes":[]},"uthrow":{"subactionIndex":249,"subactionName":"PlyFalco5K_Share_ACTION_ThrowHi_figatree","totalFrames":38,"projectiles":[18,20,24],"iasa":null,"throw":{"damage":2,"angle":90,"kbGrowth":110,"weightDepKb":0,"baseKb":18,"element":12},"hitFrames":[],"hitboxes":[]},"dthrow":{"subactionIndex":250,"subactionName":"PlyFalco5K_Share_ACTION_ThrowLw_figatree","totalFrames":43,"projectiles":[23,25,28,31],"iasa":null,"throw":{"damage":1,"angle":270,"kbGrowth":40,"weightDepKb":0,"baseKb":37,"element":8},"hitFrames":[],"hitboxes":[]}}');
        character = "Falco";
        obj = JSON.parse(falco_data);
    }

    //ground moves
    function getJab(action){
        console.log(obj);
        var start = obj.jab1;
        var move = "jab";
        getMove(character,start,move);
    }

    function getDashAttack(agent){
        console.log(obj);
        var start = obj.dashattack;
        var move = "dash attack";
        getMove(character,start, move);
    }
    function getFtilt(action){
        console.log(obj);
        var start = obj.ftilt_m;
        var move = "forward tilt";
        getMove(character,start,move);
    }

    function getUtilt(action){
        console.log(obj);
        var start = obj.utilt;
        var move = "up tilt";
        getMove(character,start,move);
    }
    function getDtilt(action){
        console.log(obj);
        var start = obj.dtilt;
        var move = "down tilt";
        getMove(character,start,move);
    }
    function getFsmash(action){
        console.log(obj);
        var start = obj.fsmash_m;
        var move = "forward smash";
        getMove(character,start,move);
    }
    function getUsmash(action){
        console.log(obj);
        var start = obj.usmash;
        var move = "up smash";
        getMove(character,start,move);
    }
    function getDsmash(action){
        console.log(obj);
        var start = obj.dsmash;
        var move = "down smash";
        getMove(character,start,move);
    }

    //aerials
    function getNair(action){
        console.log(obj);
        var start = obj.nair;
        var move = "neutral air";
        getMove(character,start,move);
    }
    function getFair(action){
        console.log(obj);
        var start = obj.fair;
        var move = "forward air";
        getMove(character,start,move);
    }
    function getBair(action){
        console.log(obj);
        var start = obj.bair;
        var move = "back air";
        getMove(character,start,move);
    }
    function getUair(action){
        console.log(obj);
        var start = obj.uair;
        var move = "up air";
        getMove(character,start,move);
    }
    function getDair(action){
        console.log(obj);
        var start = obj.dair;
        var move = "down air";
        getMove(character,start,move);
    }

   // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
   // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Frame Data Welcome', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('get_fox', setFox);
  intentMap.set('get_falco', setFalco);
  intentMap.set('get_jab', getJab);
  intentMap.set('get_dashAttack', getDashAttack);
  intentMap.set('get_forwardTilt', getFtilt);
  intentMap.set('get_upTilt', getUtilt);
  intentMap.set('get_downTilt', getDtilt);
  intentMap.set('get_forwardSmash', getFsmash);
  intentMap.set('get_upSmash', getUsmash);
  intentMap.set('get_downSmash', getDsmash);
  intentMap.set('get_neutralAir', getNair);
  intentMap.set('get_forwardAir', getFair);
  intentMap.set('get_backAir', getBair);
  intentMap.set('get_upAir', getUair);
  intentMap.set('get_downAir', getDair);
  agent.handleRequest(intentMap);
});
