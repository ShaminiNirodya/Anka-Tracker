import { Test, TestingModule } from '@nestjs/testing';
import { TimeLogsService } from './time-logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeLog } from './time-log.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

describe('TimeLogsService', () => {
  let service: TimeLogsService;
  let repo: Repository<TimeLog>;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeLogsService,
        {
          provide: getRepositoryToken(TimeLog),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TimeLogsService>(TimeLogsService);
    repo = module.get<Repository<TimeLog>>(getRepositoryToken(TimeLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('stopTimer', () => {
    it('should calculate duration correctly upon stopping', async () => {
      const startTime = new Date(Date.now() - 3600000); // 1 hour ago
      const mockActiveTimer = {
        id: '1',
        startTime,
        endTime: null,
        duration: null,
      };

      mockRepo.findOne.mockResolvedValue(mockActiveTimer);
      mockRepo.save.mockImplementation((val) => Promise.resolve(val));

      const user = { id: 'user-1' } as User;
      const result = await service.stopTimer(user);

      expect(result).toBeDefined();
      expect(result.endTime).toBeInstanceOf(Date);
      // Duration should be approximately 3600 seconds
      expect(result.duration).toBeGreaterThanOrEqual(3600);
      expect(result.duration).toBeLessThanOrEqual(3605);
    });
  });
});
