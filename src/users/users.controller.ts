import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from './roles/roles.decorator';
import { Role } from './roles/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from './roles/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.TeamLead, Role.Agent)
  findAll(
    @Query('page') page: number,
    @Query('search') search: string,
    @Query('role') role: string,
    @Query('department') department: string,
  ) {
    return this.usersService.findAll(page, search, role, department);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.TeamLead)
  update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto, req);
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager)
  remove(@Body('email') email: string) {
    return this.usersService.remove(email);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadFile(file);
  }
}
