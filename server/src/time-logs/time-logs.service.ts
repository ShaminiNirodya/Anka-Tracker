import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TimeLog } from './time-log.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TimeLogsService {
    constructor(
        @InjectRepository(TimeLog)
        private timeLogsRepository: Repository<TimeLog>,
    ) { }

    async getActiveTimer(user: User): Promise<TimeLog | null> {
        return this.timeLogsRepository.findOne({
            where: { userId: user.id, endTime: IsNull() },
            relations: ['task'],
        });
    }

    async startTimer(taskId: string, user: User): Promise<TimeLog> {
        const active = await this.getActiveTimer(user);

        if (active) {
            await this.stopTimer(user);
        }

        const newLog = this.timeLogsRepository.create({
            taskId,
            userId: user.id,
            startTime: new Date(),
        });
        return this.timeLogsRepository.save(newLog);
    }

    async stopTimer(user: User): Promise<TimeLog> {
        const active = await this.getActiveTimer(user);

        if (!active) {
            throw new NotFoundException('No active timer found');
        }

        active.endTime = new Date();
        // Calculate duration in seconds
        active.duration = Math.floor((active.endTime.getTime() - active.startTime.getTime()) / 1000);

        return this.timeLogsRepository.save(active);
    }

    async getLogsForTask(taskId: string, user: User): Promise<TimeLog[]> {
        return this.timeLogsRepository.find({
            where: { taskId, userId: user.id },
            order: { startTime: 'DESC' },
        });
    }

    async getTotalTimeForTask(taskId: string, user: User): Promise<number> {
        const logs = await this.timeLogsRepository.find({
            where: { taskId, userId: user.id },
        });
        return logs.reduce((acc, log) => acc + (log.duration || 0), 0);
    }

    async getTotalTimeForAllTasks(user: User): Promise<Record<string, number>> {
        const logs = await this.timeLogsRepository.find({
            where: { userId: user.id },
        });
        const totals: Record<string, number> = {};
        for (const log of logs) {
            if (!totals[log.taskId]) totals[log.taskId] = 0;
            totals[log.taskId] += log.duration || 0;
        }
        return totals;
    }
}
