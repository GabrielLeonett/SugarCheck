import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Request,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { PushChanges } from '../../app/PushChanges';
import { PullChanges } from '../../app/PullChanges';
import { PushChangesDTO } from './DTOs/push-changes.dto';
import { PullChangesQueryDTO } from './DTOs/pull-changes.dto';

@Controller('sync')
@UseGuards(AuthGuard)
export class SyncController {
  constructor(
    @Inject('PushChanges')
    private readonly pushChanges: PushChanges,
    @Inject('PullChanges')
    private readonly pullChanges: PullChanges,
  ) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(@Request() req: any, @Body() body: PushChangesDTO) {
    const userId = req.user.sub;
    const result = await this.pushChanges.run({
      userId,
      changes: body.changes,
    });
    if (!result.isValid) {
      throw new BadRequestException(result.getError().message);
    }
    return result.getValue();
  }

  @Get('pull')
  async pull(@Request() req: any, @Query() query: PullChangesQueryDTO) {
    const userId = req.user.sub;
    const result = await this.pullChanges.run({
      userId,
      lastPulledAt: query.lastPulledAt ?? null,
    });
    if (!result.isValid) {
      throw new BadRequestException(result.getError().message);
    }
    return result.getValue();
  }
}
