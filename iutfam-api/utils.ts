import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { AuthModule } from 'src/auth/auth.module';
import { MessagesModule } from 'src/messages/messages.module';

export function isEmailAllowed(email: string): boolean {
  const raw = process.env.ALLOWED_EMAIL_DOMAINS ?? "";
  const list = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (list.length === 0 || list.includes("*")) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && list.includes(domain);
}

