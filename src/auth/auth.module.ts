import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "../users/schemas/user.schema";
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from "@nestjs/config";
import { JwtAuthGuard } from './jwt-auth.guard';
import {JwtStrategy} from "./jwt-auth.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('jwt_secret'),
        signOptions: {expiresIn: config.get<string>('jwt_exp')},
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy]
})
export class AuthModule {}
