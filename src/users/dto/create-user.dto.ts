import {IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    department: string;

    @IsNotEmpty()
    @IsString()
    role: string;

    @IsOptional()
    @IsString()
    leader: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
