import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as ExcelJS from 'exceljs';
import { Role } from './roles/role.enum';
import { isEmpty } from 'lodash';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    await this.userModel.create({
      ...createUserDto,
      password: bcrypt.hashSync(createUserDto.password, salt),
    });
    return { success: true };
  }

  async findAll(
    page = 1,
    search = undefined,
    role: string,
    department: string,
  ) {
    const skip = (page - 1) * 10;
    const filter: { $or?: any; role?: string; department?: string } = {};

    if (search)
      filter.$or = [
        { email: { $regex: new RegExp(search) } },
        { name: { $regex: new RegExp(search) } },
      ];
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await this.userModel
      .find(filter)
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(10)
      .then((users) => users.map((user) => new UserDto(user)));
    const total = await this.userModel.countDocuments();
    return {
      success: true,
      users,
      total,
      totalPages: Math.ceil(total / 10),
      page,
    };
  }

  async update(updateUserDto: UpdateUserDto, req) {
    const requester = req.user;
    const user = await this.userModel.findOne({ email: updateUserDto.email });
    if (requester.role === Role.TeamLead && user.leader !== requester.email)
      throw new ForbiddenException();
    user.name = updateUserDto.name;
    user.role = updateUserDto.role;
    user.department = updateUserDto.department;
    await user.save();
    return { success: true };
  }

  async remove(email: string) {
    if (email === 'lakpriya@gmail.com')
      return { success: false, message: 'cannot delete Super User' };
    await this.userModel.deleteOne({ email });
    return { success: true };
  }

  async uploadFile(file: Express.Multer.File) {
    const workBook = new ExcelJS.Workbook();
    await workBook.xlsx.load(file.buffer);
    const workSheet = workBook.getWorksheet('Sheet1');
    let users: User[] = [];
    const arr = [];

    workSheet.eachRow((row) => {
      if (row.values instanceof Array)
        arr.push(row.values.filter((value) => !!value));
    });
    const keyValues = arr.shift();
    const keys = keyValues.map((key) => key.toLowerCase());

    arr.map((userRow) => {
      const user: any = {};
      userRow.forEach((value, index) => {
        user[keys[index]] = value;
      });
      users.push(user);
    });
    users = users.map((user) => {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(`${user.password}`, salt);
      return user;
    });
    const existingUserEmails = await this.userModel
      .find({
        email: { $in: users.map((user) => user.email) },
      })
      .select(['email'])
      .then((users) => users.map((user) => user.email));

    const newUsers = users.filter(
      (user) => !existingUserEmails.includes(user.email),
    );
    const existingUsers = users.filter((user) =>
      existingUserEmails.includes(user.email),
    );
    const promises = [
      this.userModel.create(newUsers),
      ...existingUsers.map((user) => {
        const { email, ...data } = user;
        return this.userModel.updateOne({ email }, { $set: data });
      }),
    ];

    await Promise.all(promises);

    return { success: true };
  }
}
