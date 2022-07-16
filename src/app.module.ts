import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, Auth],
})
export class AppModule {}
