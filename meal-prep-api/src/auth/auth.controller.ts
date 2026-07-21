import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() authDto: AuthDto) {
    return this.authService.signup(authDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Sobrescreve código 201 (default POST) para 200 OK
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }
}
