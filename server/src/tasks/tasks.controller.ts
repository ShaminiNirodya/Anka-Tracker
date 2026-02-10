import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
        return this.tasksService.create(createTaskDto, req.user);
    }

    @Get()
    findAll(@Request() req: any, @Query() query: any) {
        return this.tasksService.findAll(req.user, query);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.tasksService.findOne(id, req.user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
        return this.tasksService.update(id, updateTaskDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.tasksService.remove(id, req.user);
    }
}
