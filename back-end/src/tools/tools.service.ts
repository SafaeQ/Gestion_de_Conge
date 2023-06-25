import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Tool } from 'entities/tools';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(Tool)
    private toolsRepository: Repository<Tool>,
  ) {}
  // create sponsor
  async insert(toolData: Tool) {
    return await this.toolsRepository.save(toolData);
  }
  // find sponsor
  async findOne(id: number) {
    return await this.toolsRepository.findOne({
      relations: ['entity'],
      where: {
        id,
      },
    });
  }

  async findAllTools() {
    return await this.toolsRepository.find({
      where: {
        active: true,
      },
      relations: ['entity'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllToolsByEntity(entity: number) {
    return await this.toolsRepository.find({
      where: {
        active: true,
        entity: {
          id: entity,
        },
      },
      relations: ['entity'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // delete bulk sponsors
  async delete(ids: number[]) {
    return await this.toolsRepository.delete(ids);
  }

  // delete one sponsor
  async deleteOne(id: number) {
    return await this.toolsRepository.delete(id);
  }

  // update sponsor
  async update(id: number, toolData: Tool) {
    return await this.toolsRepository.update(id, toolData);
  }
}
