//shield prototype
function Shield(type,def,dmg){
    this.type = type; //type of shield e/h
    this.def = def; // pogloshenie 0 - 1
    this.dmg = dmg; // stoimost pogloshenia
}
//legs proto
function Legs(main,second,weapon){
    this.main = main;//regular move
    this.secondary = second;//sondary move like jump or smthn
    this.weapon = weapon;//legs like weapon - class Weapon
}
//weapon proto
function Weapon(name,dmg_min,dmg_max,type,sub,sub_max,arm,knock,range_min,range_max){
    this.name = name;//weapon name
    this.min = dmg_min;//minimum dmg
    this.max = dmg_max;//maximum dmg
    this.type = type;//type of dmg heat/phys/electro
    this.sub = sub;// sub dmg for heat and electro weapons
    this.sub_max = sub_max;//damage to maximum of sub stat
    this.arm = arm;//damage to enemy armor
    this.knock_back = knock;//pushin/pulling abilities od weapon
    this.range_min = range_min;//range of weapon
    this.range_max = range_max;//range of weapon
}
/*Mech prototype for combat*/
function MechCombat(hp,armor,energy,energy_regen,heat,heat_regen,shield,pos,side,weapons,legs){
    this.hp = hp;//health
    this.armor = {
        p: armor.p || 0,
        h: armor.h || 0,
        e: armor.e || 0
    };
    this.energy = energy;//energy
    this.energy_regen = energy_regen;//energy regeneration
    this.heat = heat;//heat
    this.heat_regen = heat_regen;//heat regeneration
    this.shield = shield;
    this.hp_cur = hp;
    this.armor_cur = {
        p: armor.p || 0,
        h: armor.h || 0,
        e: armor.e || 0
    };
    this.energy_cur = energy;//energy
    this.energy_regen_cur = energy_regen;//energy regeneration
    this.heat_cur = heat;//heat
    this.heat_regen_cur = heat_regen;//heat regeneration
    this.position = pos; // position on field 0 - 10
    this.side = side; //player or enemy true/false
    this.weapons = weapons;
    this.weapons.push(legs.weapon);
    this.legs = legs;
    this.actions = [];
}


function Combat(){
    var that = this;

    this.mechs = [];//player - 1st, enemy - 2nd
    this.turn = 0;//1st - 0, second - 1
    this.orientation = 1;//1 - 12, -1 - 21
    this.size = 9;//field size - index of most right field
    this.action = 1;//action counter

    this.atack = function(player,dmg) {
        var enemy = that.mechs[Number(!player.side)];
        var damage = Math.floor(Math.random() * (dmg.max - dmg.min + 1)) + dmg.min;
        var range = abs(player.position - enemy.position);
        var damage_full = 0;
        var damage_hp = 0;
        var damage_sub = 0;
        var damage_max = 0;
        var damage_shield = 0;

        if(player.side != that.turn){
            return false
            //wrong turn
        }

        if(range > dmg.range_max ||  range < dmg.range_min){
            return false
            //wrong range
        }

        //calculate damages
        damage_full = (damage - enemy.armor_cur[dmg.type]);
        if (damage_full < 0){damage_full = 0;}
        damage_hp = damage_full*(1 - enemy.shield.def);

        damage_sub += dmg.sub;
        damage_max += dmg.sub_max;

        damage_shield += damage_full * enemy.shield.def * enemy.shield.dmg;
        //deal damage

        if(dmg.type == "h") {
            enemy.heat_cur += damage_sub;
            enemy.heat -= damage_max;
        }
        if(dmg.type == "e") {
            enemy.energy_cur -= damage_sub;
            enemy.energy -= damage_max;
        }
        if(enemy.shield.type == "h"){
            enemy.heat_cur += damage_shield;
        }
        if(enemy.shield.type == "e"){
            enemy.energy_cur -= damage_shield;
        }
        enemy.hp_cur -= damage_hp;
        enemy.armor_cur[dmg.type] -= dmg.arm;


        that.move(enemy,player,dmg.knock_back);

        that.afterDMG();
    }

    this.afterDMG = function(){
        var enemy = that.mechs[Number(!that.turn)];
        var player = that.mechs[that.turn];

        if(enemy.hp_cur <= 0){
            that.win(that.turn);
        }
        if (enemy.heat_cur > enemy.heat){
            //ohladite trahanie
        }
        if (enemy.energy_cur < 0){
            enemy.energy_cur = 0;
        }

        that.redraw(that.mechs[0]);
        that.redraw(that.mechs[1]);

        //that.turn = Number(!that.turn);
        that.turnEnd();
    }

    this.afterAction = function(){

    }

    this.redraw = function(mech){
        var field = document.getElementById('field');
        var legend = document.querySelector('#p' + mech.side + ' .legend');
        var cell = field.querySelector('.p' + mech.side);
        if(cell != null){cell.classList.remove('p'+ mech.side);}
        field.getElementsByTagName('div')[mech.position].classList.add('p'+ mech.side);

        legend.innerHTML = 'HP:'+ mech.hp_cur +'/'+ mech.hp +
        '<br />ARM' + mech.armor_cur.p + '/'+ mech.armor_cur.h + '/' + mech.armor_cur.e +
        '<br />En:' + mech.energy_cur + '/' + mech.energy + ' +' + mech.energy_regen +
        '<br /> He:'+ mech.heat_cur + '/' + mech.heat + ' +' + mech.heat_regen;

        //legend.innerHTML = JSON.stringify(mech, null, 2);
    }

    this.move = function(mech,enemy,move){
        var direction = (1 - that.turn * 2)*that.orientation;//current mech direction

        mech.position += move * direction;

        if (that.mechs[0].position * that.orientation >= that.mechs[1].position * that.orientation){
            mech.position = enemy.position + direction*(1-2*Number(mech.side==that.turn));
        } else if(mech.position > that.size){
            mech.position = that.size;
        } else if(mech.position < 0){
            mech.position = 0;
        }
    }

    this.init = function(player,enemy){
        this.mechs = [player,enemy];

        this.redraw(that.mechs[0]);
        this.redraw(that.mechs[1]);

        this.echoControls(that.mechs[0]);
        this.echoControls(that.mechs[1]);

        document.querySelector('#game').innerHTML = "turn: " + that.turn + "<br /> orientation: "+ that.orientation + "<br /> action: "+ that.action;
    }

    this.echoControls = function(mech) {
        function drawButton(cl,action,content){
            var butt = document.createElement('div');

            butt.classList.add('button',cl);
            butt.addEventListener("click", action);
            butt.innerHTML = content;
            controls.appendChild(butt);
        }

        var controls = document.createElement('div');

        controls.classList.add('controls','p' + mech.side);

        mech.weapons.forEach(function(wep,i,weps){
            drawButton('weapon',function(){that.atack(mech,wep)},wep.name);
        });

        drawButton('movement',function(){that.movement(mech,1)},'forward main');
        //drawButton('movement',function(){that.move(mech,that.mechs[Number(!mech.side)],-mech.legs.main)},'backward main');

        document.querySelector('#p'+ mech.side).appendChild(controls);
    }

    this.movement = function(mech,dir){
        if(mech.side != that.turn){
            return false
            //wrong turn
        }
        that.move(mech,that.mechs[Number(!mech.side)],mech.legs.main*dir);
        that.redraw(mech);
        that.turnEnd();
    }

    this.turnEnd = function(){
        that.action--;
        if(that.action < 1){
            that.turn = Number(!that.turn);
            that.action = 2;
        }
        document.querySelector('#game').innerHTML = "turn: " + that.turn + "<br /> orientation: "+ that.orientation + "<br /> action: "+ that.action;
    }

    this.win = function(){
        alert(that.turn +' - player won!');
    }
}
