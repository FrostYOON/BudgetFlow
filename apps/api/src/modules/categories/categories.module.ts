import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
