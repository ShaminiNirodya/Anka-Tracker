import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Time Tracking')
@ApiBearerAuth()
@Controller('time-logs')
@UseGuards(JwtAuthGuard)
export class TimeLogsController {
    constructor(private readonly timeLogsService: TimeLogsService) { }

    @Post('start')
    startTimer(@Body('taskId') taskId: string, @Request() req: any) {
        return this.timeLogsService.startTimer(taskId, req.user);
    }

    @Post('stop')
    stopTimer(@Request() req: any) {
        return this.timeLogsService.stopTimer(req.user);
    }

    @Get('active')
    getActiveTimer(@Request() req: any) {
        return this.timeLogsService.getActiveTimer(req.user);
    }

    @Get('task/:taskId')
    getLogsForTask(@Param('taskId') taskId: string, @Request() req: any) {
        return this.timeLogsService.getLogsForTask(taskId, req.user);
    }

    @Get('totals')
    getTotalTimeForAllTasks(@Request() req: any) {
        return this.timeLogsService.getTotalTimeForAllTasks(req.user);
    }
}
