import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser, CurrentUser } from './current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate a user and return a JWT access token' })
  @ApiOkResponse({ description: 'Authenticated' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and return a JWT access token' })
  @ApiCreatedResponse({ description: 'Registered' })
  @ApiConflictResponse({ description: 'Email already in use' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.fullname);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the current authenticated user profile' })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
