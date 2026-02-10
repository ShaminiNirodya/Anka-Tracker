import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';

@Entity('time_logs')
export class TimeLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ type: 'int', nullable: true }) // Duration in seconds
    duration: number;

    @ManyToOne(() => Task, (task) => task.id, { onDelete: 'CASCADE' })
    task: Task;

    @Column()
    taskId: string;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @Column()
    userId: string;
}
