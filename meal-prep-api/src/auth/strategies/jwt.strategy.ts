import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'chave-secreta-marmita-prep-123',
    });
  }

  async validate(payload: any) {
    // O retorno deste método é anexado ao objeto Request como 'req.user'
    return { userId: payload.sub, email: payload.email };
  }
}
