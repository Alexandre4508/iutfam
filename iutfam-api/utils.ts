import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { AuthModule } from 'src/auth/auth.module';
import { MessagesModule } from 'src/messages/messages.module';

export function isEmailAllowed(
  email: string,
  allowed = (process.env.ALLOWED_EMAIL_DOMAINS ?? '').split(',').filter(Boolean)
) {
  if (!allowed.length) return true; // fallback permissif si non configuré
  return allowed.some((suffix) => email.endsWith(suffix));
}