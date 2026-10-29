import { SpireHero, SpireEnemy, SpireCard, StatusEffect, FloatingText } from '../types/spire';
import {
  upgradeCard,
  createWoundCard,
  createDazedCard,
  createBurnCard,
  createSlimedCard,
} from '../data/spireCards';

export interface CombatActionResult {
  hero: SpireHero;
  enemy: SpireEnemy;
  logs: string[];
  floatingTexts: FloatingText[];
  isVictory?: boolean;
  isDefeat?: boolean;
}

export interface CardPreviewStats {
  effectiveDamage?: number;
  isDamageBoosted?: boolean;
  isDamageReduced?: boolean;
  effectiveBlock?: number;
  isBlockBoosted?: boolean;
  isBlockReduced?: boolean;
  dynamicDescription: string;
}

export class SpireCombatEngine {
  /**
   * Computes live dynamic card numbers (Strength, Weak, Vulnerable, Dexterity, Frail, Body Slam, Perfected Strike)
   * just like Slay the Spire's real-time hand preview.
   */
  static computeCardPreview(card: SpireCard, hero?: SpireHero, enemy?: SpireEnemy): CardPreviewStats {
    if (!hero || !enemy) {
      return { dynamicDescription: card.description };
    }

    let effectiveDamage: number | undefined = undefined;
    let isDamageBoosted = false;
    let isDamageReduced = false;

    const isBodySlam = card.id.startsWith('barrier_impact');
    const isPerfectedStrike = card.id.startsWith('precision_strike');

    if (card.type === 'attack' && (card.damage !== undefined || isBodySlam)) {
      let baseDmg = card.damage || 0;
      if (isBodySlam) {
        baseDmg = hero.block;
      } else if (isPerfectedStrike) {
        const strikeCount = this.countStrikeCards(hero);
        baseDmg += strikeCount * (card.magicNumber || 2);
      }

      let dmg = baseDmg;
      let strength = this.getStatusAmount(hero.statuses, 'strength');
      if (hero.relics.some(r => r.id === 'crimson_overdrive') && hero.hp <= hero.maxHp / 2) {
        strength += 3;
      }

      if (card.id.startsWith('colossus_edge')) {
        dmg += strength * (card.magicNumber || 3);
      } else {
        dmg += strength;
      }

      if (this.getStatusAmount(hero.statuses, 'weak') > 0) {
        dmg = Math.floor(dmg * 0.75);
      }

      if (this.getStatusAmount(enemy.statuses, 'vulnerable') > 0) {
        const vulnMult = hero.relics.some(r => r.id === 'vulnerability_matrix') ? 1.75 : 1.5;
        dmg = Math.floor(dmg * vulnMult);
      }

      // Pen Nib (Quantum Edge) check: if counter is at 9, next attack deals double!
      const penNib = hero.relics.find(r => r.id === 'quantum_edge');
      if (penNib && penNib.counter === 9) {
        dmg *= 2;
      }

      dmg = Math.max(0, dmg);
      effectiveDamage = dmg;
      const compareBase = isBodySlam ? hero.block : card.damage || 0;
      isDamageBoosted = dmg > compareBase;
      isDamageReduced = dmg < compareBase;
    }

    let effectiveBlock: number | undefined = undefined;
    let isBlockBoosted = false;
    let isBlockReduced = false;

    if (card.block !== undefined) {
      let blk = card.block + this.getStatusAmount(hero.statuses, 'dexterity');
      if (this.getStatusAmount(hero.statuses, 'frail') > 0) {
        blk = Math.floor(blk * 0.75);
      }
      blk = Math.max(0, blk);
      effectiveBlock = blk;
      isBlockBoosted = blk > card.block;
      isBlockReduced = blk < card.block;
    }

    let dynamicDescription = card.description;
    if (isBodySlam && effectiveDamage !== undefined) {
      dynamicDescription = `Deal ${effectiveDamage} damage (equal to your current Barrier).`;
    } else if (effectiveDamage !== undefined && card.damage !== undefined) {
      const modTag = isDamageBoosted ? `*${effectiveDamage}*` : isDamageReduced ? `${effectiveDamage}` : `${effectiveDamage}`;
      dynamicDescription = dynamicDescription.replace(new RegExp(`\\b${card.damage}\\b`), modTag);
    }
    if (effectiveBlock !== undefined && card.block !== undefined) {
      const modTag = isBlockBoosted ? `*${effectiveBlock}*` : `${effectiveBlock}`;
      dynamicDescription = dynamicDescription.replace(new RegExp(`\\b${card.block}\\b`), modTag);
    }

    return {
      effectiveDamage,
      isDamageBoosted,
      isDamageReduced,
      effectiveBlock,
      isBlockBoosted,
      isBlockReduced,
      dynamicDescription,
    };
  }

  /**
   * Computes live incoming enemy attack damage (accounting for Enemy Strength, Weak, and Hero Vulnerable).
   */
  static computeEnemyAttackPreview(hero: SpireHero, enemy: SpireEnemy): { perHit: number; hits: number; isModified: boolean } {
    const intent = enemy.intent;
    const hits = intent.hits || 1;
    const enemyStr = this.getStatusAmount(enemy.statuses, 'strength');
    let dmg = intent.value + enemyStr;
    if (this.getStatusAmount(enemy.statuses, 'weak') > 0) {
      dmg = Math.floor(dmg * 0.75);
    }
    if (this.getStatusAmount(hero.statuses, 'vulnerable') > 0) {
      dmg = Math.floor(dmg * 1.5);
    }
    dmg = Math.max(0, dmg);
    return {
      perHit: dmg,
      hits,
      isModified: dmg !== intent.value,
    };
  }

  static startCombat(hero: SpireHero, enemy: SpireEnemy): CombatActionResult {
    const logs: string[] = [`⚡ Encounter engaged: ${enemy.name} (${enemy.title})!`];
    const floatingTexts: FloatingText[] = [];

    const updatedHero: SpireHero = {
      ...hero,
      energy: hero.maxEnergy,
      block: 0,
      drawPile: this.shuffle([...hero.deck]),
      hand: [],
      discardPile: [],
      exhaustPile: [],
      statuses: [],
      relics: hero.relics.map(r => ({ ...r })),
    };

    const updatedEnemy: SpireEnemy = {
      ...enemy,
      block: enemy.block || 0,
      statuses: enemy.statuses.map(s => ({ ...s })),
      aiTurn: 1,
    };

    // Start-of-Combat Relic Triggers
    for (const relic of updatedHero.relics) {
      if (relic.id === 'dark_matter_prism') {
        this.addStatus(updatedHero.statuses, 'strength', 1);
        logs.push(`🔮 Dark Matter Prism granted +1 Strength!`);
        floatingTexts.push({ id: Math.random().toString(), text: '+1 STR', color: '#A855F7', type: 'buff' });
      }
      if (relic.id === 'kinetic_plate') {
        updatedHero.block += 10;
        logs.push(`🛡️ Kinetic Inertia Plate deployed 10 Barrier!`);
        floatingTexts.push({ id: Math.random().toString(), text: '+10 WARD', color: '#38BDF8', type: 'block' });
      }
      if (relic.id === 'bio_ampoule') {
        updatedHero.hp = Math.min(updatedHero.maxHp, updatedHero.hp + 2);
        logs.push(`🧪 Bio-Regen Ampoule restored 2 Vitality!`);
      }
      if (relic.id === 'targeting_uplink') {
        this.applyDebuffToEnemy(updatedEnemy, 'vulnerable', 1, logs);
        logs.push(`📡 Targeting Uplink applied 1 Vulnerable to ${updatedEnemy.name}!`);
      }
      if (relic.id === 'auxiliary_reactor') {
        updatedHero.energy += 1;
        logs.push(`⚡ Auxiliary Reactor surged +1 Energy for Turn 1!`);
      }
      if (relic.id === 'resonance_capacitor') {
        relic.counter = 1; // 1 = ready to boost first attack
      }
      if (relic.id === 'molecular_disruptor' && enemy.title.includes('Elite')) {
        const reduction = Math.round(updatedEnemy.maxHp * 0.25);
        updatedEnemy.hp -= reduction;
        logs.push(`🧬 Molecular Disruptor reduced Elite HP by ${reduction}!`);
      }
      if (relic.id === 'tachyon_emitter') {
        this.dealDamageToUnit(updatedEnemy, 3, logs, 'Tachyon Emitter', floatingTexts);
      }
    }

    // Draw initial 5 cards
    this.drawCards(updatedHero, updatedEnemy, 5, logs, floatingTexts);

    // Generate initial intent
    updatedEnemy.intent = updatedEnemy.pattern(1, updatedEnemy.hp, updatedEnemy.maxHp);

    return { hero: updatedHero, enemy: updatedEnemy, logs, floatingTexts };
  }

  static playCard(
    hero: SpireHero,
    enemy: SpireEnemy,
    cardIndex: number
  ): CombatActionResult {
    const logs: string[] = [];
    const floatingTexts: FloatingText[] = [];
    const card = hero.hand[cardIndex];

    if (!card) {
      return { hero, enemy, logs: ['Invalid card!'], floatingTexts, isVictory: false };
    }
    if (card.unplayable) {
      return { hero, enemy, logs: [`${card.name} is unplayable!`], floatingTexts, isVictory: false };
    }
    if (hero.energy < card.cost) {
      return { hero, enemy, logs: ['Not enough energy!'], floatingTexts, isVictory: false };
    }

    const updatedHero: SpireHero = {
      ...hero,
      energy: hero.energy - card.cost,
      hand: [...hero.hand],
      drawPile: [...hero.drawPile],
      discardPile: [...hero.discardPile],
      exhaustPile: [...hero.exhaustPile],
      statuses: hero.statuses.map(s => ({ ...s })),
      relics: hero.relics.map(r => ({ ...r })),
    };

    const updatedEnemy: SpireEnemy = {
      ...enemy,
      statuses: enemy.statuses.map(s => ({ ...s })),
    };

    // Remove the played card from hand first so hand-affecting cards (Armaments, Second Wind, Fiend Fire, True Grit) don't target the card being played
    updatedHero.hand.splice(cardIndex, 1);

    // Enemy Enrage passive (Gremlin Nob / Cyber-Gorgon Prime) when player plays a Skill
    const enrageAmt = this.getStatusAmount(updatedEnemy.statuses, 'enrage');
    if (card.type === 'skill' && enrageAmt > 0) {
      this.addStatus(updatedEnemy.statuses, 'strength', enrageAmt);
      logs.push(`👹 ${updatedEnemy.name} enrages from your Skill! (+${enrageAmt} Strength)`);
      floatingTexts.push({ id: Math.random().toString(), text: `+${enrageAmt} STR (ENRAGE)`, color: '#EF4444', type: 'buff' });
    }

    // Check Double Tap (Dual Execution) for Attacks
    let executions = 1;
    if (card.type === 'attack') {
      const doubleTapAmt = this.getStatusAmount(updatedHero.statuses, 'double_tap');
      if (doubleTapAmt > 0) {
        executions = 2;
        this.addStatus(updatedHero.statuses, 'double_tap', -1);
        logs.push(`⚔️ Dual Execution triggered! ${card.name} executes TWICE!`);
      }
    }

    for (let exec = 0; exec < executions; exec++) {
      if (updatedEnemy.hp <= 0) break;

      // 1. Attack Processing
      if (card.type === 'attack') {
        // Sacrificial HP cost (Hemokinesis / Bio-Lance)
        if (card.id.startsWith('bio_lance')) {
          this.loseHpFromCard(updatedHero, card.magicNumber || 2, logs, floatingTexts);
        }

        let baseDamage = card.damage || 0;
        if (card.id.startsWith('barrier_impact')) {
          baseDamage = updatedHero.block;
        } else if (card.id.startsWith('precision_strike')) {
          const strikeCount = this.countStrikeCards(updatedHero) + 1; // +1 for itself
          baseDamage += strikeCount * (card.magicNumber || 2);
        }

        // Akabeko (Resonance Capacitor) first attack bonus
        const akabeko = updatedHero.relics.find(r => r.id === 'resonance_capacitor');
        if (akabeko && akabeko.counter === 1) {
          baseDamage += 8;
          akabeko.counter = 0;
          logs.push(`🔔 Resonance Capacitor boosted first attack by +8 damage!`);
        }

        let finalDamage = baseDamage;
        let strength = this.getStatusAmount(updatedHero.statuses, 'strength');
        if (updatedHero.relics.some(r => r.id === 'crimson_overdrive') && updatedHero.hp <= updatedHero.maxHp / 2) {
          strength += 3;
        }

        if (card.id.startsWith('colossus_edge')) {
          finalDamage += strength * (card.magicNumber || 3);
        } else {
          finalDamage += strength;
        }

        if (this.getStatusAmount(updatedHero.statuses, 'weak') > 0) {
          finalDamage = Math.floor(finalDamage * 0.75);
        }

        if (this.getStatusAmount(updatedEnemy.statuses, 'vulnerable') > 0) {
          const vulnMult = updatedHero.relics.some(r => r.id === 'vulnerability_matrix') ? 1.75 : 1.5;
          finalDamage = Math.floor(finalDamage * vulnMult);
        }

        // Pen Nib (Quantum Edge) every 10th attack double damage
        const penNib = updatedHero.relics.find(r => r.id === 'quantum_edge');
        if (penNib) {
          penNib.counter = (penNib.counter || 0) + 1;
          if (penNib.counter >= 10) {
            finalDamage *= 2;
            penNib.counter = 0;
            logs.push(`✒️ Quantum Edge 10th Attack! DOUBLE DAMAGE!`);
            floatingTexts.push({ id: Math.random().toString(), text: '2x QUANTUM CRIT!', color: '#F59E0B', type: 'buff' });
          }
        }

        finalDamage = Math.max(0, finalDamage);

        let hits = 1;
        if (card.id.startsWith('dual_phase_blades')) {
          hits = card.magicNumber || 2;
        } else if (card.id.startsWith('plasma_ricochet')) {
          hits = card.magicNumber || 3;
        } else if (card.id.startsWith('kinetic_vortex')) {
          hits = card.magicNumber || 2;
        } else if (card.id.startsWith('flurry_barrage')) {
          hits = card.magicNumber || 4;
        } else if (card.id.startsWith('singularity_purge')) {
          // Fiend Fire: Exhaust all cards currently in hand!
          const handToExhaust = [...updatedHero.hand];
          updatedHero.hand = [];
          hits = handToExhaust.length;
          for (const exCard of handToExhaust) {
            this.exhaustCard(updatedHero, updatedEnemy, exCard, logs, floatingTexts);
          }
        }

        let totalUnblockedDealt = 0;
        for (let h = 0; h < hits; h++) {
          const unblocked = this.dealDamageToUnit(updatedEnemy, finalDamage, logs, card.name, floatingTexts);
          totalUnblockedDealt += unblocked;
        }

        // Curl Up passive on enemy (Spark Arachnid / Louse)
        const curlUp = this.getStatusAmount(updatedEnemy.statuses, 'curl_up');
        if (curlUp > 0 && hits > 0 && updatedEnemy.hp > 0) {
          updatedEnemy.block += curlUp;
          this.removeStatus(updatedEnemy.statuses, 'curl_up');
          logs.push(`🕷️ ${updatedEnemy.name}'s Curl Up activated (+${curlUp} Barrier)!`);
        }

        // Mode Shift on Aegis Construct Boss (The Guardian)
        const modeShift = updatedEnemy.statuses.find(s => s.type === 'mode_shift');
        if (modeShift && totalUnblockedDealt > 0 && updatedEnemy.hp > 0) {
          modeShift.amount -= totalUnblockedDealt;
          if (modeShift.amount <= 0) {
            this.removeStatus(updatedEnemy.statuses, 'mode_shift');
            updatedEnemy.block += 20;
            this.addStatus(updatedEnemy.statuses, 'thorns', 3);
            logs.push(`🤖 ${updatedEnemy.name} shifted into Defensive Mode! (+20 Barrier & +3 Thorns)`);
            floatingTexts.push({ id: Math.random().toString(), text: 'DEFENSIVE SHIFT!', color: '#38BDF8', type: 'block' });
          }
        }

        // Attack Side-Effects
        if (card.id.startsWith('gravity_crush')) {
          this.applyDebuffToEnemy(updatedEnemy, 'vulnerable', card.magicNumber || 2, logs);
        }
        if (card.id.startsWith('kinetic_suppression')) {
          this.applyDebuffToEnemy(updatedEnemy, 'weak', card.magicNumber || 2, logs);
        }
        if (card.id.startsWith('neutron_hammer')) {
          this.applyDebuffToEnemy(updatedEnemy, 'weak', card.magicNumber || 1, logs);
          this.applyDebuffToEnemy(updatedEnemy, 'vulnerable', card.magicNumber || 1, logs);
        }
        if (card.id.startsWith('seismic_shockwave')) {
          this.applyDebuffToEnemy(updatedEnemy, 'vulnerable', card.magicNumber || 1, logs);
        }
        if (card.id.startsWith('disruption_blade')) {
          this.drawCards(updatedHero, updatedEnemy, card.magicNumber || 1, logs, floatingTexts);
        }
        if (card.id.startsWith('fury_rebound')) {
          const angerCopy: SpireCard = {
            ...card,
            id: `fury_rebound_${Math.random().toString(36).substring(2, 7)}`,
          };
          updatedHero.discardPile.push(angerCopy);
          logs.push(`Fury Rebound duplicated into discard matrix!`);
        }
        if (card.id.startsWith('cranial_smash')) {
          if (updatedHero.discardPile.length > 0) {
            const retrieved = updatedHero.discardPile.pop()!;
            updatedHero.drawPile.unshift(retrieved);
            logs.push(`Cranial Smash retrieved ${retrieved.name} to the top of draw deck!`);
          }
        }
        if (card.id.startsWith('overload_slash')) {
          const wound = createWoundCard();
          updatedHero.drawPile.push(wound);
          updatedHero.drawPile = this.shuffle(updatedHero.drawPile);
          logs.push(`Overload Slash shuffled a System Glitch into draw pile.`);
        }
        if (card.id.startsWith('blind_charge')) {
          const dazed = createDazedCard();
          updatedHero.drawPile.push(dazed);
          updatedHero.drawPile = this.shuffle(updatedHero.drawPile);
          logs.push(`Blind Charge shuffled a Neural Static into draw pile.`);
        }
        if (card.id.startsWith('plasma_supernova')) {
          updatedHero.discardPile.push(createBurnCard());
          logs.push(`Plasma Supernova added a Thermal Burn to discard pile.`);
        }
        if (card.id.startsWith('escalating_strike')) {
          const scaleAmt = card.magicNumber || 5;
          card.damage = (card.damage || 8) + scaleAmt;
          card.description = `Deal ${card.damage} damage. Increase this card's damage by ${scaleAmt} this combat.`;
          logs.push(`Escalating Strike ramped up to ${card.damage} base damage!`);
        }
        if (card.id.startsWith('life_siphon') && updatedEnemy.hp <= 0) {
          const maxHpGain = card.magicNumber || 3;
          updatedHero.maxHp += maxHpGain;
          updatedHero.hp += maxHpGain;
          logs.push(`🧬 Bio-Harvester fatal strike! Permanently gained +${maxHpGain} Max HP!`);
          floatingTexts.push({ id: Math.random().toString(), text: `+${maxHpGain} MAX HP`, color: '#10B981', type: 'heal' });
        }
        if (card.id.startsWith('vampiric_scythe') && totalUnblockedDealt > 0) {
          const healAmount = Math.min(totalUnblockedDealt, updatedHero.maxHp - updatedHero.hp);
          if (healAmount > 0) {
            updatedHero.hp += healAmount;
            logs.push(`🩸 Vampiric Scythe restored ${healAmount} HP from unblocked damage!`);
            floatingTexts.push({ id: Math.random().toString(), text: `+${healAmount} HP`, color: '#10B981', type: 'heal' });
          }
        }
        if (card.block) {
          this.gainBlock(updatedHero, updatedEnemy, card.block, logs, floatingTexts);
        }
      }
    }

    // 2. Skill Processing
    if (card.type === 'skill') {
      if (card.block && !card.id.startsWith('emergency_reboot')) {
        this.gainBlock(updatedHero, updatedEnemy, card.block, logs, floatingTexts);
      }
      if (card.id.startsWith('nanite_surge')) {
        this.drawCards(updatedHero, updatedEnemy, 1, logs, floatingTexts);
      }
      if (card.id.startsWith('combat_focus')) {
        this.drawCards(updatedHero, updatedEnemy, card.magicNumber || 3, logs, floatingTexts);
      }
      if (card.id.startsWith('bio_overcharge')) {
        const flexAmt = card.magicNumber || 2;
        this.addStatus(updatedHero.statuses, 'strength', flexAmt);
        this.addStatus(updatedHero.statuses, 'temp_strength_down', flexAmt);
        logs.push(`Adrenaline Surge granted +${flexAmt} temporary Strength!`);
        floatingTexts.push({ id: Math.random().toString(), text: `+${flexAmt} STR`, color: '#F59E0B', type: 'buff' });
      }
      if (card.id.startsWith('blood_infusion')) {
        const hpSacrifice = 3;
        const energyGain = card.magicNumber || 2;
        this.loseHpFromCard(updatedHero, hpSacrifice, logs, floatingTexts);
        updatedHero.energy += energyGain;
        logs.push(`Aether Siphon sacrificed ${hpSacrifice} HP for +${energyGain} Energy!`);
        floatingTexts.push({ id: Math.random().toString(), text: `+${energyGain}⚡`, color: '#38BDF8', type: 'buff' });
      }
      if (card.id.startsWith('transcendence_offering')) {
        const hpSacrifice = 6;
        const energyGain = 2;
        const drawCount = card.magicNumber || 3;
        this.loseHpFromCard(updatedHero, hpSacrifice, logs, floatingTexts);
        updatedHero.energy += energyGain;
        this.drawCards(updatedHero, updatedEnemy, drawCount, logs, floatingTexts);
        logs.push(`Aether Overload sacrificed ${hpSacrifice} HP: +${energyGain} Energy & drew ${drawCount} cards!`);
        floatingTexts.push({ id: Math.random().toString(), text: `+${energyGain}⚡`, color: '#38BDF8', type: 'buff' });
      }
      if (card.id.startsWith('reactive_barrier')) {
        const curBlock = updatedHero.block;
        if (curBlock > 0) {
          this.gainBlock(updatedHero, updatedEnemy, curBlock, logs, floatingTexts, true);
          logs.push(`Kinetic Reinforce doubled Barrier: ${curBlock} -> ${updatedHero.block}!`);
        }
      }
      if (card.id.startsWith('limit_amplifier')) {
        const curStr = this.getStatusAmount(updatedHero.statuses, 'strength');
        if (curStr > 0) {
          this.addStatus(updatedHero.statuses, 'strength', curStr);
          logs.push(`Overdrive Surge doubled Strength: ${curStr} -> ${curStr * 2}!`);
          floatingTexts.push({ id: Math.random().toString(), text: `2x STR (${curStr * 2})`, color: '#F59E0B', type: 'buff' });
        } else {
          logs.push(`Overdrive Surge deployed, but current Strength is 0.`);
        }
      }
      if (card.id.startsWith('spot_vulnerability')) {
        if (updatedEnemy.intent.type === 'attack' || updatedEnemy.intent.type === 'attack_defend' || updatedEnemy.intent.type === 'attack_debuff') {
          const strGain = card.magicNumber || 3;
          this.addStatus(updatedHero.statuses, 'strength', strGain);
          logs.push(`Target Analysis confirmed aggressive posture: +${strGain} Strength!`);
          floatingTexts.push({ id: Math.random().toString(), text: `+${strGain} STR`, color: '#F59E0B', type: 'buff' });
        } else {
          logs.push(`Target Analysis detected defensive posture; no Strength gained.`);
        }
      }
      if (card.id.startsWith('emp_discharge')) {
        this.applyDebuffToEnemy(updatedEnemy, 'strength', -(card.magicNumber || 2), logs);
        floatingTexts.push({ id: Math.random().toString(), text: `-${card.magicNumber || 2} STR`, color: '#94A3B8', type: 'buff' });
      }
      if (card.id.startsWith('gravity_wave')) {
        const amt = card.magicNumber || 3;
        this.applyDebuffToEnemy(updatedEnemy, 'weak', amt, logs);
        this.applyDebuffToEnemy(updatedEnemy, 'vulnerable', amt, logs);
      }
      if (card.id.startsWith('system_jammer')) {
        this.applyDebuffToEnemy(updatedEnemy, 'weak', card.magicNumber || 1, logs);
      }
      if (card.id.startsWith('reactor_surge')) {
        const eGain = card.magicNumber || 2;
        updatedHero.energy += eGain;
        logs.push(`Reactor Surge generated +${eGain} Energy!`);
        floatingTexts.push({ id: Math.random().toString(), text: `+${eGain}⚡`, color: '#38BDF8', type: 'buff' });
      }
      if (card.id.startsWith('emergency_reboot')) {
        // Second Wind: Exhaust all non-Attack cards in hand and gain block for each
        const nonAttacks = updatedHero.hand.filter(c => c.type !== 'attack');
        updatedHero.hand = updatedHero.hand.filter(c => c.type === 'attack');
        for (const na of nonAttacks) {
          this.gainBlock(updatedHero, updatedEnemy, card.block || 5, logs, floatingTexts);
          this.exhaustCard(updatedHero, updatedEnemy, na, logs, floatingTexts);
        }
        logs.push(`Emergency Reboot exhausted ${nonAttacks.length} non-Attack cards!`);
      }
      if (card.id.startsWith('core_fortification')) {
        updatedHero.hand.push(createWoundCard(), createWoundCard());
        logs.push(`Core Fortification added 2 System Glitches to hand.`);
      }
      if (card.id.startsWith('dual_execution')) {
        this.addStatus(updatedHero.statuses, 'double_tap', card.magicNumber || 1);
        logs.push(`Dual Execution armed: Next ${card.magicNumber || 1} Attack(s) execute twice!`);
      }
      if (card.id.startsWith('quantum_recall')) {
        if (updatedHero.exhaustPile.length > 0) {
          const recalled = updatedHero.exhaustPile.pop()!;
          updatedHero.hand.push(recalled);
          logs.push(`Quantum Recall retrieved ${recalled.name} from Exhaust!`);
        } else {
          logs.push(`Exhaust pile is empty.`);
        }
      }
      if (card.id.startsWith('plasma_shield')) {
        this.addStatus(updatedHero.statuses, 'thorns', card.magicNumber || 4);
        logs.push(`Plasma Shield charged: Reflect ${card.magicNumber || 4} retaliatory damage!`);
      }
      if (card.id.startsWith('fortified_resilience')) {
        if (updatedHero.hand.length > 0) {
          const rIndex = Math.floor(Math.random() * updatedHero.hand.length);
          const purged = updatedHero.hand.splice(rIndex, 1)[0];
          this.exhaustCard(updatedHero, updatedEnemy, purged, logs, floatingTexts);
        }
      }
      if (card.id.startsWith('battle_cry')) {
        this.drawCards(updatedHero, updatedEnemy, card.magicNumber || 1, logs, floatingTexts);
        if (updatedHero.hand.length > 0) {
          const topDeck = updatedHero.hand.pop()!;
          updatedHero.drawPile.unshift(topDeck);
          logs.push(`Battle Cry repositioned ${topDeck.name} to the top of draw deck.`);
        }
      }
      if (card.id.startsWith('hyper_tune')) {
        updatedHero.hand = updatedHero.hand.map(c => (c.isUpgraded ? c : upgradeCard(c)));
        logs.push(`Hyper-Tune overclocked cards in hand!`);
      }
    }

    // 3. Power Processing
    if (card.type === 'power') {
      if (card.id.startsWith('void_overdrive')) {
        this.addStatus(updatedHero.statuses, 'demon_form', card.magicNumber || 2);
        logs.push(`Void Overdrive active! (+${card.magicNumber || 2} Strength each turn)`);
      }
      if (card.id.startsWith('overcharge')) {
        this.addStatus(updatedHero.statuses, 'strength', card.magicNumber || 2);
        logs.push(`Channeled +${card.magicNumber || 2} Strength!`);
        floatingTexts.push({ id: Math.random().toString(), text: `+${card.magicNumber || 2} STR`, color: '#F59E0B', type: 'buff' });
      }
      if (card.id.startsWith('nanite_plating')) {
        this.addStatus(updatedHero.statuses, 'metallicize', card.magicNumber || 3);
        logs.push(`Nanite Plating active! (+${card.magicNumber || 3} Barrier at turn end)`);
      }
      if (card.id.startsWith('perpetual_aegis')) {
        this.addStatus(updatedHero.statuses, 'barricade', 1);
        logs.push(`Perpetual Aegis active! Barrier persists between rounds.`);
      }
      if (card.id.startsWith('berserk_matrix')) {
        const bonusEnergy = card.isUpgraded ? 2 : 1;
        this.addStatus(updatedHero.statuses, 'berserk', bonusEnergy);
        if (!card.isUpgraded) {
          this.addStatus(updatedHero.statuses, 'vulnerable', 1);
        }
        logs.push(`Core Accelerator engaged! +${bonusEnergy} Energy per turn.`);
        floatingTexts.push({ id: Math.random().toString(), text: `+${bonusEnergy} PWR`, color: '#8B5CF6', type: 'buff' });
      }
      if (card.id.startsWith('tactical_absorption')) {
        this.addStatus(updatedHero.statuses, 'feel_no_pain', card.magicNumber || 3);
        logs.push(`Tactical Absorption online! (+${card.magicNumber || 3} Barrier per Exhaust)`);
      }
      if (card.id.startsWith('void_conduit')) {
        this.addStatus(updatedHero.statuses, 'dark_embrace', 1);
        logs.push(`Void Conduit online! (Draw 1 card per Exhaust)`);
      }
      if (card.id.startsWith('adaptive_subroutines')) {
        this.addStatus(updatedHero.statuses, 'evolve', card.magicNumber || 1);
        logs.push(`Adaptive Subroutines online! (Draw ${card.magicNumber || 1} on Status draw)`);
      }
      if (card.id.startsWith('thermal_venting')) {
        this.addStatus(updatedHero.statuses, 'fire_breathing', card.magicNumber || 6);
        logs.push(`Thermal Venting online! (${card.magicNumber || 6} dmg on Status/Curse draw)`);
      }
      if (card.id.startsWith('pain_feedback')) {
        this.addStatus(updatedHero.statuses, 'rupture', card.magicNumber || 1);
        logs.push(`Pain Feedback online! (+${card.magicNumber || 1} STR when losing HP from cards)`);
      }
      if (card.id.startsWith('core_bleed')) {
        this.addStatus(updatedHero.statuses, 'combust', card.magicNumber || 5);
        logs.push(`Core Bleed online! (Deal ${card.magicNumber || 5} dmg at turn end)`);
      }
      if (card.id.startsWith('kinetic_juggernaut')) {
        this.addStatus(updatedHero.statuses, 'juggernaut', card.magicNumber || 5);
        logs.push(`Kinetic Juggernaut online! (Deal ${card.magicNumber || 5} dmg whenever gaining Barrier)`);
      }
      if (card.id.startsWith('neural_overclock')) {
        this.addStatus(updatedHero.statuses, 'brutality', 1);
        logs.push(`Neural Overclock online! (Draw +1 card each turn)`);
      }
    }

    // Destination of played card: Powers are consumed into active buffs, Exhaust cards go to exhaustPile, others to discardPile
    if (card.type === 'power') {
      // Powers stay active in status bar, not placed in discard
    } else if (card.exhaust) {
      this.exhaustCard(updatedHero, updatedEnemy, card, logs, floatingTexts);
    } else {
      updatedHero.discardPile.push(card);
    }

    // Check Spore Cloud death rattle (Mycelial Drone / Fungi Beast)
    const isVictory = updatedEnemy.hp <= 0;
    if (isVictory) {
      const sporeCloud = this.getStatusAmount(updatedEnemy.statuses, 'spore_cloud');
      if (sporeCloud > 0) {
        this.addStatus(updatedHero.statuses, 'vulnerable', sporeCloud);
        logs.push(`🍄 ${updatedEnemy.name} ruptured into a Spore Cloud! (Inflicted ${sporeCloud} Vulnerable)`);
      }
      logs.push(`🏆 ${updatedEnemy.name} was neutralized!`);
    }

    return { hero: updatedHero, enemy: updatedEnemy, logs, floatingTexts, isVictory };
  }

  static endTurn(hero: SpireHero, enemy: SpireEnemy): CombatActionResult {
    const logs: string[] = ['--- Hostile Phase ---'];
    const floatingTexts: FloatingText[] = [];

    const updatedHero: SpireHero = {
      ...hero,
      hand: [...hero.hand],
      drawPile: [...hero.drawPile],
      discardPile: [...hero.discardPile],
      exhaustPile: [...hero.exhaustPile],
      statuses: hero.statuses.map(s => ({ ...s })),
      relics: hero.relics.map(r => ({ ...r })),
    };

    const updatedEnemy: SpireEnemy = {
      ...enemy,
      statuses: enemy.statuses.map(s => ({ ...s })),
    };

    // 1. Process cards remaining in hand (Burn damage & Ethereal exhausting)
    const remainingHand = [...updatedHero.hand];
    updatedHero.hand = [];
    for (const c of remainingHand) {
      if (c.id.startsWith('status_burn')) {
        const burnDmg = c.magicNumber || 2;
        this.dealDamageToUnit(updatedHero, burnDmg, logs, c.name, floatingTexts);
      }
      if (c.ethereal) {
        this.exhaustCard(updatedHero, updatedEnemy, c, logs, floatingTexts);
      } else {
        updatedHero.discardPile.push(c);
      }
    }

    // Clear Double Tap at end of turn
    this.removeStatus(updatedHero.statuses, 'double_tap');

    // Revert Flex temporary strength (temp_strength_down)
    const tempStrLoss = this.getStatusAmount(updatedHero.statuses, 'temp_strength_down');
    if (tempStrLoss > 0) {
      this.addStatus(updatedHero.statuses, 'strength', -tempStrLoss);
      this.removeStatus(updatedHero.statuses, 'temp_strength_down');
      logs.push(`Adrenaline Surge wore off (-${tempStrLoss} Strength).`);
    }

    // Combust (Core Bleed) end-of-turn effect
    const combustDmg = this.getStatusAmount(updatedHero.statuses, 'combust');
    if (combustDmg > 0 && updatedEnemy.hp > 0) {
      this.loseHpFromCard(updatedHero, 1, logs, floatingTexts);
      this.dealDamageToUnit(updatedEnemy, combustDmg, logs, 'Core Bleed', floatingTexts);
    }

    // Metallicize (Nanite Plating) end-of-turn Barrier
    const metallicize = this.getStatusAmount(updatedHero.statuses, 'metallicize');
    if (metallicize > 0) {
      this.gainBlock(updatedHero, updatedEnemy, metallicize, logs, floatingTexts, true);
    }

    // Orichalcum (Nanite Barrier Emitter) Relic
    const hasEmitter = updatedHero.relics.some(r => r.id === 'nanite_emitter');
    if (hasEmitter && updatedHero.block === 0) {
      this.gainBlock(updatedHero, updatedEnemy, 6, logs, floatingTexts, true);
      logs.push(`💠 Nanite Emitter deployed 6 emergency Barrier!`);
    }

    // Check if enemy died to Combust or Juggernaut before acting
    if (updatedEnemy.hp <= 0) {
      logs.push(`🏆 ${updatedEnemy.name} was neutralized!`);
      return { hero: updatedHero, enemy: updatedEnemy, logs, floatingTexts, isVictory: true };
    }

    // Enemy Metallicize
    const enemyMetal = this.getStatusAmount(updatedEnemy.statuses, 'metallicize');
    if (enemyMetal > 0) {
      updatedEnemy.block += enemyMetal;
    }

    // Enemy executes telegraphed intent
    const intent = updatedEnemy.intent;
    const enemyStrength = this.getStatusAmount(updatedEnemy.statuses, 'strength');

    if (intent.type === 'attack' || intent.type === 'attack_defend' || intent.type === 'attack_debuff') {
      let dmg = intent.value + enemyStrength;
      if (this.getStatusAmount(updatedEnemy.statuses, 'weak') > 0) {
        dmg = Math.floor(dmg * 0.75);
      }
      if (this.getStatusAmount(updatedHero.statuses, 'vulnerable') > 0) {
        dmg = Math.floor(dmg * 1.5);
      }
      dmg = Math.max(0, dmg);

      const hits = intent.hits || 1;
      for (let h = 0; h < hits; h++) {
        this.dealDamageToUnit(updatedHero, dmg, logs, updatedEnemy.name, floatingTexts);

        // Thorns retaliatory reflection (e.g. Plasma Shield)
        const thorns = this.getStatusAmount(updatedHero.statuses, 'thorns');
        if (thorns > 0 && updatedEnemy.hp > 0) {
          this.dealDamageToUnit(updatedEnemy, thorns, logs, 'Plasma Shield Thorns', floatingTexts);
        }
      }
    }

    if (intent.type === 'defend' || intent.type === 'attack_defend') {
      const blockGain = intent.secondaryValue || intent.value;
      updatedEnemy.block += blockGain;
      logs.push(`${updatedEnemy.name} deployed ${blockGain} Barrier.`);
    }

    if (intent.type === 'buff') {
      this.addStatus(updatedEnemy.statuses, 'strength', intent.value);
      logs.push(`${updatedEnemy.name} channeled +${intent.value} Strength!`);
      if (intent.secondaryValue) {
        updatedEnemy.block += intent.secondaryValue;
      }
    }

    if (intent.type === 'debuff' || intent.type === 'attack_debuff') {
      const desc = intent.description.toLowerCase();
      if (desc.includes('corrosive slime')) {
        const count = intent.secondaryValue || 1;
        for (let i = 0; i < count; i++) {
          updatedHero.discardPile.push(createSlimedCard());
        }
        logs.push(`☣️ ${updatedEnemy.name} injected ${count} Corrosive Slime(s) into discard!`);
      } else if (desc.includes('neural static')) {
        const count = intent.value || 2;
        for (let i = 0; i < count; i++) {
          updatedHero.discardPile.push(createDazedCard());
        }
        logs.push(`💫 ${updatedEnemy.name} injected ${count} Neural Static cards into discard!`);
      } else if (desc.includes('thermal burn')) {
        updatedHero.discardPile.push(createBurnCard());
        logs.push(`🔥 ${updatedEnemy.name} injected a Thermal Burn into discard!`);
      } else if (desc.includes('time siphon')) {
        this.addStatus(updatedHero.statuses, 'strength', -1);
        this.addStatus(updatedHero.statuses, 'dexterity', -1);
        logs.push(`🌀 ${updatedEnemy.name} drained -1 Strength and -1 Dexterity!`);
      } else if (desc.includes('vulnerable') && desc.includes('weak')) {
        this.addStatus(updatedHero.statuses, 'weak', intent.value);
        this.addStatus(updatedHero.statuses, 'vulnerable', intent.value);
        logs.push(`${updatedEnemy.name} afflicted you with Weak & Vulnerable!`);
      } else if (desc.includes('vulnerable')) {
        this.addStatus(updatedHero.statuses, 'vulnerable', intent.secondaryValue || intent.value);
        logs.push(`${updatedEnemy.name} afflicted you with Vulnerable!`);
      } else {
        this.addStatus(updatedHero.statuses, 'weak', intent.secondaryValue || intent.value);
        logs.push(`${updatedEnemy.name} afflicted your systems with Weak!`);
      }
    }

    // Decrement temporary statuses
    this.tickDownStatuses(updatedHero.statuses);
    this.tickDownStatuses(updatedEnemy.statuses);

    // Remove one-turn thorns on Hero
    this.removeStatus(updatedHero.statuses, 'thorns');

    // --- Start Next Player Turn ---
    logs.push('--- Operational Phase: Your Turn ---');
    const nextPlayerTurn = updatedEnemy.aiTurn + 1;

    // Barrier retention check (Barricade / Perpetual Aegis)
    const hasBarricade = this.getStatusAmount(updatedHero.statuses, 'barricade') > 0;
    if (!hasBarricade) {
      updatedHero.block = 0;
    }

    // Horn Cleat (Phase Stabilizer) Turn 2 & Captain's Wheel (Aegis Gyroscope) Turn 3
    if (nextPlayerTurn === 2 && updatedHero.relics.some(r => r.id === 'phase_stabilizer')) {
      this.gainBlock(updatedHero, updatedEnemy, 14, logs, floatingTexts, true);
      logs.push(`⚓ Phase Stabilizer auto-deployed 14 Barrier for Turn 2!`);
    }
    if (nextPlayerTurn === 3 && updatedHero.relics.some(r => r.id === 'aegis_gyroscope')) {
      this.gainBlock(updatedHero, updatedEnemy, 18, logs, floatingTexts, true);
      logs.push(`☸️ Aegis Gyroscope auto-deployed 18 Barrier for Turn 3!`);
    }

    // Mercury Hourglass (Tachyon Emitter) start of turn damage
    if (updatedHero.relics.some(r => r.id === 'tachyon_emitter') && updatedEnemy.hp > 0) {
      this.dealDamageToUnit(updatedEnemy, 3, logs, 'Tachyon Emitter', floatingTexts);
    }

    // Recharge energy + berserk power bonus
    const berserkBonus = this.getStatusAmount(updatedHero.statuses, 'berserk');
    updatedHero.energy = updatedHero.maxEnergy + berserkBonus;
    if (berserkBonus > 0) {
      logs.push(`Core Accelerator supplied +${berserkBonus} extra Energy!`);
    }

    // Turn start powers: Demon Form (Void Overdrive) & Brutality (Neural Overclock)
    const voidOverdrive = this.getStatusAmount(updatedHero.statuses, 'demon_form');
    if (voidOverdrive > 0) {
      this.addStatus(updatedHero.statuses, 'strength', voidOverdrive);
      logs.push(`Void Overdrive granted +${voidOverdrive} Strength!`);
    }

    let cardsToDraw = 5;
    const brutality = this.getStatusAmount(updatedHero.statuses, 'brutality');
    if (brutality > 0) {
      this.loseHpFromCard(updatedHero, brutality, logs, floatingTexts);
      cardsToDraw += brutality;
      logs.push(`Neural Overclock drew +${brutality} extra card!`);
    }

    // Draw cards for the new turn
    this.drawCards(updatedHero, updatedEnemy, cardsToDraw, logs, floatingTexts);

    // Hostile prepares next intent
    updatedEnemy.aiTurn = nextPlayerTurn;
    updatedEnemy.block = 0;
    updatedEnemy.intent = updatedEnemy.pattern(updatedEnemy.aiTurn, updatedEnemy.hp, updatedEnemy.maxHp);

    const isVictory = updatedEnemy.hp <= 0;
    const isDefeat = updatedHero.hp <= 0;
    return { hero: updatedHero, enemy: updatedEnemy, logs, floatingTexts, isVictory, isDefeat };
  }

  private static exhaustCard(
    hero: SpireHero,
    enemy: SpireEnemy,
    card: SpireCard,
    logs: string[],
    floatingTexts: FloatingText[]
  ): void {
    hero.exhaustPile.push(card);
    logs.push(`${card.name} exhausted.`);

    // Sentinel (Aegis Protocol): if exhausted, gain 2 (3+) Energy
    if (card.id.startsWith('aegis_protocol')) {
      const eGain = card.magicNumber || 2;
      hero.energy += eGain;
      logs.push(`🛡️ Aegis Protocol exhaust trigger: +${eGain} Energy!`);
      floatingTexts.push({ id: Math.random().toString(), text: `+${eGain}⚡`, color: '#38BDF8', type: 'buff' });
    }

    // Feel No Pain (Tactical Absorption): gain Barrier on exhaust
    const fnp = this.getStatusAmount(hero.statuses, 'feel_no_pain');
    if (fnp > 0) {
      this.gainBlock(hero, enemy, fnp, logs, floatingTexts, true);
    }

    // Dark Embrace (Void Conduit): draw card on exhaust
    const darkEmbrace = this.getStatusAmount(hero.statuses, 'dark_embrace');
    if (darkEmbrace > 0) {
      this.drawCards(hero, enemy, darkEmbrace, logs, floatingTexts);
    }
  }

  private static loseHpFromCard(
    hero: SpireHero,
    amount: number,
    logs: string[],
    floatingTexts: FloatingText[]
  ): void {
    hero.hp = Math.max(1, hero.hp - amount);
    floatingTexts.push({ id: Math.random().toString(), text: `-${amount} HP`, color: '#EF4444', type: 'damage' });

    // Rupture (Pain Feedback): gain Strength when losing HP from a card
    const rupture = this.getStatusAmount(hero.statuses, 'rupture');
    if (rupture > 0) {
      this.addStatus(hero.statuses, 'strength', rupture);
      logs.push(`💢 Pain Feedback channeled +${rupture} Strength from HP sacrifice!`);
      floatingTexts.push({ id: Math.random().toString(), text: `+${rupture} STR`, color: '#F59E0B', type: 'buff' });
    }
  }

  private static applyDebuffToEnemy(
    enemy: SpireEnemy,
    type: StatusEffect['type'],
    amount: number,
    logs: string[]
  ): void {
    const artifact = this.getStatusAmount(enemy.statuses, 'artifact');
    if (artifact > 0) {
      this.addStatus(enemy.statuses, 'artifact', -1);
      if (this.getStatusAmount(enemy.statuses, 'artifact') <= 0) {
        this.removeStatus(enemy.statuses, 'artifact');
      }
      logs.push(`🛡️ ${enemy.name}'s Artifact negated ${type.toUpperCase()}!`);
      return;
    }
    this.addStatus(enemy.statuses, type, amount);
    logs.push(`Inflicted ${Math.abs(amount)} ${type.toUpperCase()} on ${enemy.name}!`);
  }

  private static dealDamageToUnit(
    unit: { hp: number; block: number; name: string },
    damage: number,
    logs: string[],
    sourceName: string,
    floatingTexts: FloatingText[]
  ): number {
    if (damage <= 0) return 0;

    if (unit.block > 0) {
      if (unit.block >= damage) {
        unit.block -= damage;
        logs.push(`${sourceName} hit ${unit.name}'s Barrier for ${damage}.`);
        floatingTexts.push({ id: Math.random().toString(), text: `-${damage} WARD`, color: '#38BDF8', type: 'block' });
        return 0;
      } else {
        const remainingDmg = damage - unit.block;
        logs.push(`${sourceName} shattered ${unit.name}'s ${unit.block} Barrier!`);
        unit.block = 0;
        unit.hp = Math.max(0, unit.hp - remainingDmg);
        logs.push(`${unit.name} took ${remainingDmg} damage!`);
        floatingTexts.push({ id: Math.random().toString(), text: `-${remainingDmg}`, color: '#EF4444', type: 'damage' });
        return remainingDmg;
      }
    }

    unit.hp = Math.max(0, unit.hp - damage);
    logs.push(`${sourceName} struck ${unit.name} for ${damage} damage!`);
    floatingTexts.push({ id: Math.random().toString(), text: `-${damage}`, color: '#EF4444', type: 'damage' });
    return damage;
  }

  private static gainBlock(
    hero: SpireHero,
    enemy: SpireEnemy,
    baseBlock: number,
    logs: string[],
    floatingTexts: FloatingText[],
    raw: boolean = false
  ): void {
    let finalBlock = baseBlock;
    if (!raw) {
      finalBlock += this.getStatusAmount(hero.statuses, 'dexterity');
      if (this.getStatusAmount(hero.statuses, 'frail') > 0) {
        finalBlock = Math.floor(finalBlock * 0.75);
      }
    }
    finalBlock = Math.max(0, finalBlock);
    if (finalBlock <= 0) return;

    hero.block += finalBlock;
    logs.push(`Generated ${finalBlock} Barrier.`);
    floatingTexts.push({ id: Math.random().toString(), text: `+${finalBlock} WARD`, color: '#38BDF8', type: 'block' });

    // Juggernaut (Kinetic Juggernaut) trigger: deal damage whenever Barrier is gained
    const juggernautDmg = this.getStatusAmount(hero.statuses, 'juggernaut');
    if (juggernautDmg > 0 && enemy.hp > 0) {
      this.dealDamageToUnit(enemy, juggernautDmg, logs, 'Kinetic Juggernaut', floatingTexts);
    }
  }

  private static drawCards(
    hero: SpireHero,
    enemy: SpireEnemy,
    count: number,
    logs: string[],
    floatingTexts: FloatingText[]
  ): void {
    for (let i = 0; i < count; i++) {
      if (hero.drawPile.length === 0) {
        if (hero.discardPile.length === 0) break;
        hero.drawPile = this.shuffle([...hero.discardPile]);
        hero.discardPile = [];
        logs.push(`Recycled discard matrix into draw deck.`);
      }
      const card = hero.drawPile.pop();
      if (card) {
        hero.hand.push(card);

        // Evolve (Adaptive Subroutines) & Fire Breathing (Thermal Venting) triggers on Status/Curse draw
        if (card.type === 'status' || card.type === 'curse') {
          const fireBreathing = this.getStatusAmount(hero.statuses, 'fire_breathing');
          if (fireBreathing > 0 && enemy.hp > 0) {
            this.dealDamageToUnit(enemy, fireBreathing, logs, 'Thermal Venting', floatingTexts);
          }
          if (card.type === 'status') {
            const evolve = this.getStatusAmount(hero.statuses, 'evolve');
            if (evolve > 0) {
              logs.push(`🧬 Adaptive Subroutines triggered from ${card.name}!`);
              this.drawCards(hero, enemy, evolve, logs, floatingTexts);
            }
          }
        }
      }
    }
  }

  private static countStrikeCards(hero: SpireHero): number {
    const allCards = [...hero.hand, ...hero.drawPile, ...hero.discardPile];
    return allCards.filter(
      c => c.name.toLowerCase().includes('slash') || c.name.toLowerCase().includes('strike')
    ).length;
  }

  private static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private static addStatus(statuses: StatusEffect[], type: StatusEffect['type'], amount: number): void {
    const existing = statuses.find(s => s.type === type);
    if (existing) {
      existing.amount += amount;
      if (existing.amount === 0) {
        this.removeStatus(statuses, type);
      }
    } else if (amount !== 0) {
      statuses.push({ type, amount });
    }
  }

  private static removeStatus(statuses: StatusEffect[], type: StatusEffect['type']): void {
    const idx = statuses.findIndex(s => s.type === type);
    if (idx >= 0) {
      statuses.splice(idx, 1);
    }
  }

  private static getStatusAmount(statuses: StatusEffect[], type: StatusEffect['type']): number {
    return statuses.find(s => s.type === type)?.amount || 0;
  }

  private static tickDownStatuses(statuses: StatusEffect[]): void {
    for (let i = statuses.length - 1; i >= 0; i--) {
      const s = statuses[i];
      if (s.type === 'vulnerable' || s.type === 'weak' || s.type === 'frail') {
        s.amount -= 1;
        if (s.amount <= 0) {
          statuses.splice(i, 1);
        }
      }
    }
  }
}
