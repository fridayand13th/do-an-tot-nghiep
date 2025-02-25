import { Attributes, Model, ModelStatic, WhereOptions } from 'sequelize';

export abstract class BaseSequelizeService<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findAll(): Promise<T[]> {
    return this.model.findAll();
  }

  async findById(id: number): Promise<T | null> {
    return this.model.findByPk(id);
  }

  async create(data: Attributes<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: number, data: Attributes<T>): Promise<T | null> {
    const entity = await this.model.findByPk(id);
    if (!entity) {
      return null;
    }
    await entity.update(data);
    return entity;
  }

  async delete(id: number): Promise<boolean> {
    // Convert the id to an unknown type first, then to WhereOptions
    const where = { id } as unknown as WhereOptions<Attributes<T>>;

    const result = await this.model.destroy({ where });
    return result > 0;
  }
}
