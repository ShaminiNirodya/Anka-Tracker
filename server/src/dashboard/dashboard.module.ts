import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Task } from '../tasks/task.entity';
import { TimeLog } from '../time-logs/time-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TimeLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
