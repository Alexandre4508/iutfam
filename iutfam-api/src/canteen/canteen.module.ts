import { Module } from '@nestjs/common';
import { CanteenController } from './canteen.controller';
import { CanteenService } from './canteen.service';
import { PrismaModule } from '../prisma/prisma.module'; // <-- important

@Module({
  imports: [PrismaModule], 
  controllers: [CanteenController],
  providers: [CanteenService]
})
export class CanteenModule {}
