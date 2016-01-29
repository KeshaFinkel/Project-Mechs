/**
 * Created by user on 11.01.2016.
 */
/*Mech prototype*/
function Mech(hp,armor,energy,energy_regen,heat,heat_regen,shield){
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
}
