import { Op, Sequelize } from 'sequelize';

export function buildStatisticQueryParams(year: number, month: number, day: number) {
  const attributes: Array<any> = [
    [Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 'year'],
    [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')), 'month'],
  ];

  const group = [
    Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')),
    Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
  ];

  const where: any = {};

  const conditions: Array<any> = [
    Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), year),
  ];

  if (day || month) {
    group.push(Sequelize.fn('EXTRACT', Sequelize.literal('DAY FROM "created_at"')));
    attributes.push([Sequelize.fn('EXTRACT', Sequelize.literal('DAY FROM "created_at"')), 'day']);
  }

  if (month) {
    conditions.push(Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')), month));
  }

  if (day) {
    conditions.push(Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('DAY FROM "created_at"')), day));
  }

  if (conditions.length > 0) {
    where[Op.and] = conditions;
  }

  return { attributes, group, where };
}
