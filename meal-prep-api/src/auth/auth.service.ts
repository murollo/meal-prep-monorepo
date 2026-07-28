import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(authDto: AuthDto) {
    const { email, password } = authDto;

    // 1. Verifica se o e-mail já está em uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    // 2. Criptografa a senha com bcrypt (10 rounds de salt)
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Cria o usuário no banco de dados
    await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
      },
    });

    return { message: 'Usuário cadastrado com sucesso!' };
  }

  async login(authDto: AuthDto) {
    const { email, password } = authDto;

    // 1. Busca o usuário pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // 2. Compara a senha digitada com a criptografada no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // 3. Gera o Token JWT contendo o ID (sub) e e-mail do usuário
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // 1. Busca o usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // 2. Compara a senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    // 3. Criptografa a nova senha e salva
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: newPasswordHash,
      },
    });

    return { message: 'Senha atualizada com sucesso!' };
  }
}
