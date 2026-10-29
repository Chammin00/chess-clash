import { MapNode, NodeType } from '../types/spire';

export class SpireMapGenerator {
  public static readonly TOTAL_FLOORS = 15;
  public static readonly NUM_LANES = 4;

  static generateActMap(): MapNode[][] {
    const map: MapNode[][] = [];

    for (let floor = 1; floor <= this.TOTAL_FLOORS; floor++) {
      const floorNodes: MapNode[] = [];

      if (floor === this.TOTAL_FLOORS) {
        // Floor 15 is always the single Boss node in the center
        floorNodes.push({
          id: `node_${floor}_1`,
          floor,
          col: 1,
          type: 'boss',
          visited: false,
          accessible: false,
          nextIds: [],
        });
      } else if (floor === this.TOTAL_FLOORS - 1) {
        // Floor 14 is always Rest Site before the Boss
        for (let col = 0; col < 3; col++) {
          floorNodes.push({
            id: `node_${floor}_${col}`,
            floor,
            col,
            type: 'rest',
            visited: false,
            accessible: false,
            nextIds: [`node_${this.TOTAL_FLOORS}_1`],
          });
        }
      } else if (floor === 1) {
        // Floor 1 starts with accessible encounters
        for (let col = 0; col < 3; col++) {
          floorNodes.push({
            id: `node_${floor}_${col}`,
            floor,
            col,
            type: 'monster',
            visited: false,
            accessible: true,
            nextIds: [],
          });
        }
      } else {
        // Floors 2 to 13: Mix of monster, elite, rest, shop, event
        const activeCols = [0, 1, 2];
        for (const col of activeCols) {
          const type = this.getNodeTypeForFloor(floor, col);
          floorNodes.push({
            id: `node_${floor}_${col}`,
            floor,
            col,
            type,
            visited: false,
            accessible: false,
            nextIds: [],
          });
        }
      }

      map.push(floorNodes);
    }

    // Connect paths between floors
    for (let f = 0; f < map.length - 2; f++) {
      const currentFloor = map[f];
      const nextFloor = map[f + 1];

      for (const node of currentFloor) {
        const candidates = nextFloor.filter(n => Math.abs(n.col - node.col) <= 1);
        if (candidates.length > 0) {
          node.nextIds = candidates.map(c => c.id);
        } else {
          node.nextIds = [nextFloor[0].id];
        }
      }
    }

    return map;
  }

  private static getNodeTypeForFloor(floor: number, col: number): NodeType {
    if (floor === 6) {
      return col === 1 ? 'rest' : 'monster';
    }
    if (floor === 8 || floor === 9) {
      if (col === 1) return 'elite';
      return Math.random() > 0.5 ? 'event' : 'monster';
    }
    if (floor === 11) {
      return col === 0 ? 'shop' : col === 1 ? 'monster' : 'rest';
    }

    const rand = Math.random();
    if (rand < 0.45) return 'monster';
    if (rand < 0.70) return 'event';
    if (rand < 0.85) return 'shop';
    return 'rest';
  }
}
