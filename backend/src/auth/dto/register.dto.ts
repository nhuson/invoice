import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullname: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
