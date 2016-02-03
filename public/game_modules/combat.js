//shield prototype
function Shield(type,def,dmg){
    this.type = type; //type of shield e/h
    this.def = def; // pogloshenie 0 - 1
    this.dmg = dmg; // stoimost pogloshenia
}
//legs proto
function legs(main,second,weapon){
    this.main = main;//regular move
    this.secondary = second;//sondary move like jump or smthn
    this.weapon = weapon;//legs like weapon - class Weapon
}
//weapon proto
function Weapon(dmg_min,dmg_max,type,sub,sub_max,arm,knock){
    this.min = dmg_min;//minimum dmg
    this.max = dmg_max;//maximum dmg
    this.type = type;//type of dmg heat/phys/electro
    this.sub = sub;// sub dmg for heat and electro weapons
    this.sub_max = sub_max;//damage to maximum of sub stat
    this.arm = arm;//damage to enemy armor
    this.knock_back = knock;//pushin/pulling abilities od weapon
}
/*Mech prototype for combat*/
function MechCombat(hp,armor,energy,energy_regen,heat,heat_regen,shield,pos,side,weapons){
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
}


function Combat(){
    var that = this;
    this.mechs = [];//player - 1st, enemy - 2nd
    this.turn = 0;//1st - 0, second - 1
    this.orientation = 1;//1 - 12, -1 - 21
    this.size = 9;//field size - index of most right field
    this.atack = function(dmg) {
        var enemy = that.mechs[Number(!that.turn)];
        var player = that.mechs[Number(that.turn)];
        var direction = (1 - that.turn * 2)*orientation;//current mech direction
        var damage = Math.floor(Math.random() * (dmg.max - dmg.min + 1)) + dmg.min;
        console.log(damage);
        var damage_full = 0;
        var damage_hp = 0;
        var damage_sub = 0;
        var damage_max = 0;
        var damage_shield = 0;
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
        console.log(orientation);

        enemy.position += dmg.knock_back * direction;

        if (that.mechs[0].position * that.orientation >= that.mechs[1].position * that.orientation){
            enemy.position = player.position + direction;
        } else if(enemy.position > that.size){
            enemy.position = that.size;
        } else if(enemy.position < 0){
            enemy.position = 0;
        }

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
        that.turn = Number(!that.turn);
        document.querySelector('#game').innerHTML = "turn: " + that.turn + "<br /> orientation: "+ that.orientation;
    }

    this.redraw = function(mech){
        var field = document.getElementById('field');
        var legend = document.getElementById(mech.side);
        var cell = field.querySelector('.' + mech.side);
        if(cell != null){cell.classList.remove(mech.side);}
        field.getElementsByTagName('div')[mech.position].classList.add(mech.side);

        //block.innerHTML = 'HP:'+ mech.hp_cur +'/'+ mech.hp +
        //'<br />ARM' + mech.armor_cur.p + '/'+ mech.armor_cur.h + '/' + mech.armor_cur.e +
        //'<br />En:' + mech.energy_cur + '/' + mech.energy + ' +' + mech.energy_regen +
        //'<br /> He:'+ mech.heat_cur + '/' + mech.heat + ' +' + mech.heat_regen;

        legend.innerHTML = JSON.stringify(mech, null, 2);
    }

    this.init = function(player,enemy){
        this.mechs = [player,enemy];
        this.redraw(that.mechs[0]);
        this.redraw(that.mechs[1]);
        document.querySelector('#game').innerHTML = "turn: " + that.turn + "<br /> orientation: "+ that.orientation;
    }

    this.win = function(){
        alert(that.turn +' - player won!');
    }
}