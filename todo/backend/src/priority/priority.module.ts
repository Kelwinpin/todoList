import { Module } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PriorityController],
  providers: [PriorityService, PrismaService],
})
export class PriorityModule {}
