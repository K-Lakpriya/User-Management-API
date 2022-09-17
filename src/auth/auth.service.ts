import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: LoginDto) {
    const user = await this.userModel
      .findOne({ email: data.email })
      .select(['+password']);
    if (user !== null && bcrypt.compareSync(data.password, user.password)) {
      const tokenData = {
        name: user.name,
        email: user.email,
        role: user.role,
      };

      return {
        success: true,
        token: this.jwtService.sign(tokenData),
        user: tokenData,
      };
    } else
      return {
        success: false,
      };
  }
}
