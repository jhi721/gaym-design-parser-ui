import { create } from 'xmlbuilder';
import { ISpreadsheet } from './types';
const { Cols } = ISpreadsheet.Enum;

export const createXml = (creatures: Array<string[]>) => {
  const xml = create('root');

  creatures.forEach((creature) => {
    const name = creature[Cols.Name];

    const entity = xml.ele('entity', { name });

    entity.ele('id', {}, creature[Cols.Name]);

    entity.ele('Template').ele('Name', {}, 'MonsterTemplate');

    const HP = creature[Cols.HPMOD] || creature[Cols.HP];

    if (HP) {
      entity.ele('MaxHealth').ele('Value', {}, parseFloat(HP));

      entity.ele('DamageCoef', {}, '1');
    }

    const influence = creature[Cols.Influence];

    if (influence) {
      entity.ele('Influence').ele('Count', {}, parseInt(influence));
    }

    entity.ele('AddExperience').ele('Value', {}, parseInt(creature[Cols.XP]));

    entity.ele('Speed').ele('Value', {}, parseFloat(creature[Cols.SPD]));

    const tags = entity.ele('Tags').ele('Values');

    tags.ele('element', {}, 'Creature');
    tags.ele('element', {}, name);
  });

  return xml.end({ pretty: true });
};
