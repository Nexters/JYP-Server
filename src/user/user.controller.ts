import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserDTO, UserUpdateDTO } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  public async getUser(@Param('id') id: string): Promise<UserDTO> {
    return await this.userService.getUser(id);
  }

  @Patch(':id')
  public async updateUser(
    @Param('id') id: string,
    @Body() userUpdateDTO: UserUpdateDTO,
  ): Promise<UserDTO> {
    return await this.userService.updateUser(id, userUpdateDTO);
  }
}
