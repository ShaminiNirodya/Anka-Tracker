import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            user,
            userId: user.id,
        } as unknown as Task);
        return this.tasksRepository.save(task);
    }

    async findAll(user: User, query: any): Promise<Task[]> {
        const { search, status, priority, category, sortBy, sortOrder } = query;
        const qb = this.tasksRepository.createQueryBuilder('task');

        qb.where('task.userId = :userId', { userId: user.id });

        if (status) {
            qb.andWhere('task.status = :status', { status });
        }

        if (priority) {
            qb.andWhere('task.priority = :priority', { priority });
        }

        if (category) {
            qb.andWhere('task.category = :category', { category });
        }

        if (search) {
            qb.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%` });
        }

        const sortField = sortBy || 'createdAt';
        const order = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        qb.orderBy(`task.${sortField}`, order);

        return qb.getMany();
    }

    async findOne(id: string, user: User): Promise<Task> {
        const task = await this.tasksRepository.findOne({ where: { id, userId: user.id } });
        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
        const task = await this.findOne(id, user);
        await this.tasksRepository.update(id, updateTaskDto);
        return this.findOne(id, user);
    }

    async remove(id: string, user: User): Promise<void> {
        const result = await this.tasksRepository.delete({ id, userId: user.id });
        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
    }
}
