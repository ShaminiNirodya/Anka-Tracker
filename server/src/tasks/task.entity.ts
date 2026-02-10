import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 'TODO' }) // TODO, IN_PROGRESS, DONE
    status: string;

    @Column({ nullable: true })
    category: string;

    @Column({ default: 'MEDIUM' }) // LOW, MEDIUM, HIGH
    priority: string;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
