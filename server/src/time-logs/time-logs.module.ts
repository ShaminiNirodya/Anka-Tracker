import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeLogsService } from './time-logs.service';
import { TimeLogsController } from './time-logs.controller';
import { TimeLog } from './time-log.entity';
import { Task } from '../tasks/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeLog, Task])],
  providers: [TimeLogsService],
  controllers: [TimeLogsController],
  exports: [TimeLogsService],
})
export class TimeLogsModule { }
