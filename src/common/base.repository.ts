import { Logger } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  DeepPartial,
  FindOneOptions,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract readonly logger: Logger;

  constructor(private readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      this.logger.error(
        `Error finding all entities: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findById(id: number): Promise<T | null> {
    try {
      const options: FindOneOptions<T> = {
        where: { id } as FindOptionsWhere<T>,
      };
      const entity = await this.repository.findOne(options);

      if (!entity) {
        this.logger.warn(`Entity with id ${id} not found`);
        return null;
      }

      return entity;
    } catch (error) {
      this.logger.error(
        `Error finding entity by id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(
        `Error creating entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    try {
      await this.repository.update(id, data as any);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error updating entity with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return (
        result.affected !== null &&
        result.affected !== undefined &&
        result.affected > 0
      );
    } catch (error) {
      this.logger.error(
        `Error deleting entity with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
