import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
    @ApiProperty({ example: 'Complete Assignment' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ example: 'Finish the remaining tasks' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' })
    @IsEnum(['TODO', 'IN_PROGRESS', 'DONE'])
    @IsOptional()
    status?: string;

    @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' })
    @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
    @IsOptional()
    priority?: string;

    @ApiPropertyOptional({ example: 'Work' })
    @IsString()
    @IsOptional()
    category?: string;
}

export class UpdateTaskDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: ['TODO', 'IN_PROGRESS', 'DONE'] })
    @IsEnum(['TODO', 'IN_PROGRESS', 'DONE'])
    @IsOptional()
    status?: string;

    @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'] })
    @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
    @IsOptional()
    priority?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    category?: string;
}
