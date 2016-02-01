//shield prototype
function Shield(type,def,dmg){
    this.type = type; //type of shield e/h
    this.def = def; // pogloshenie 0 - 1
    this.dmg = dmg; // stoimost pogloshenia
}
//weapon proto
function Weapon(dmg_min,dmg_max,type,sub,sub_max,arm){
    this.min = dmg_min;//minimum dmg
    this.max = dmg_max;//maximum dmg
    this.type = type;//type of dmg heat/phys/electro
    this.sub = sub;// sub dmg for heat and electro weapons
    this.sub_max = sub_max;//damage to maximum of sub stat
    this.arm = arm;//damage to enemy armor
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

/*checks*/
function afterDmg(mech){
    if(mech.hp_cur <= 0){
        win();
    }
    if (mech.heat_cur > mech.heat){
        //ohladite trahanie
    }
    if (mech.energy_cur < 0){
        mech.energy_cur = 0;
    }
    echoStats(mech);
}

/*actions*/
//damagin dmg - weapon, mechD - victim
function damaging(dmg,mechD) {
    var damage = Math.floor(Math.random() * (dmg.max - dmg.min + 1)) + dmg.min;
    console.log(damage);
    var damage_full = 0;
    var damage_hp = 0;
    var damage_sub = 0;
    var damage_max = 0;
    var damage_shield = 0;
    //calculate damages
    damage_full = (damage - mechD.armor_cur[dmg.type]);
    if (damage_full < 0){damage_full = 0;}
    damage_hp = damage_full*(1 - mechD.shield.def);

    damage_sub += dmg.sub;
    damage_max += dmg.sub_max;

    damage_shield += damage_full * mechD.shield.def * mechD.shield.dmg;
    //deal damage

    if(dmg.type == "h") {
        mechD.heat_cur += damage_sub;
        mechD.heat -= damage_max;
    }
    if(dmg.type == "e") {
        mechD.energy_cur -= damage_sub;
        mechD.energy -= damage_max;
    }
    if(mechD.shield.type == "h"){
        mechD.heat_cur += damage_shield;
    }
    if(mechD.shield.type == "e"){
        mechD.energy_cur -= damage_shield;
    }
    mechD.hp_cur -= damage_hp;
    mechD.armor_cur[dmg.type] -= dmg.arm;
    afterDmg(mechD);
}
/*drawing*/
function echoStats(mech){
    var block = document.getElementById(mech.side);
    block.innerHTML = 'HP:'+ mech.hp_cur +'/'+ mech.hp +
    '<br />ARM' + mech.armor_cur.p + '/'+ mech.armor_cur.h + '/' + mech.armor_cur.e +
    '<br />En:' + mech.energy_cur + '/' + mech.energy + ' +' + mech.energy_regen +
    '<br /> He:'+ mech.heat_cur + '/' + mech.heat + ' +' + mech.heat_regen;
}
function echoField(player,enemy){
    var field = document.getElementById('field');

    field.getElementsByTagName('div')[player.position].classList.add('player');
    field.getElementsByTagName('div')[enemy.position].classList.add('enemy');
}
/*etc.*/
function win(){
    alert('pobeda');
}
function init(player,enemy){
    echoStats(player,document.querySelector('#player'));
    echoStats(enemy,document.querySelector('#enemy'));
    echoField(player,enemy);
}