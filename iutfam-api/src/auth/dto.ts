import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsString()
  className: string;

}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}
