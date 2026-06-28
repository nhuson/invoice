import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'reviewer@101digital.io' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
