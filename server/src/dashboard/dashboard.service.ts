import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { TimeLog } from '../time-logs/time-log.entity';
import { User } from '../users/user.entity';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        @InjectRepository(TimeLog)
        private timeLogsRepository: Repository<TimeLog>,
    ) { }

    async getStats(user: User) {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

        const totalTasks = await this.tasksRepository.count({
            where: { userId: user.id },
        });

        const completedTasks = await this.tasksRepository.count({
            where: { userId: user.id, status: 'DONE' },
        });

        const completedTasksToday = await this.tasksRepository.count({
            where: {
                userId: user.id,
                status: 'DONE',
                updatedAt: Between(todayStart, todayEnd),
            },
        });

        const completedTasksWeek = await this.tasksRepository.count({
            where: {
                userId: user.id,
                status: 'DONE',
                updatedAt: Between(weekStart, weekEnd),
            },
        });

        // Total seconds logged today
        const logsToday = await this.timeLogsRepository.find({
            where: {
                userId: user.id,
                startTime: Between(todayStart, todayEnd),
            },
        });
        const totalSecondsToday = logsToday.reduce((acc, log) => acc + (log.duration || 0), 0);

        // Total seconds logged this week
        const logsWeek = await this.timeLogsRepository.find({
            where: {
                userId: user.id,
                startTime: Between(weekStart, weekEnd),
            },
        });
        const totalSecondsWeek = logsWeek.reduce((acc, log) => acc + (log.duration || 0), 0);

        // All-time total seconds
        const allLogs = await this.timeLogsRepository.find({
            where: { userId: user.id },
        });
        const totalSecondsAll = allLogs.reduce((acc, log) => acc + (log.duration || 0), 0);

        return {
            totalTasks,
            completedTasks,
            completedTasksToday,
            completedTasksWeek,
            totalSecondsToday,
            totalSecondsWeek,
            totalSecondsAll,
        };
    }
}
