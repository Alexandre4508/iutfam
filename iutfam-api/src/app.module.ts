﻿import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';         // <-- AJOUT
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),          // <-- AJOUT (global)
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

