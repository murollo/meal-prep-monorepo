import { Controller, Post, Body, Patch, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ActiveUser } from './decorators/active-user.decorator';

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

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @ActiveUser() user: { userId: string },
  ) {
    return this.authService.changePassword(user.userId, changePasswordDto);
  }
}
