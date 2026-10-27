import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/infra/auth.guard';
import { GetCaminoProgreso } from '../app/GetCaminoProgreso';
import { CompletarNivelCamino } from '../app/CompletarNivelCamino';

@Controller('camino')
@UseGuards(AuthGuard)
export class CaminoController {
  constructor(
    private readonly getCaminoProgreso: GetCaminoProgreso,
    private readonly completarNivelCamino: CompletarNivelCamino,
  ) {}

  @Get('progreso')
  async getProgreso(@Request() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const progreso = await this.getCaminoProgreso.execute(userId);
    return {
      ultimoNivelCompletado: progreso.ultimoNivelCompletado,
      updatedAt: progreso.updatedAt,
    };
  }

  @Post('completar')
  async completar(@Request() req: any, @Body() body: { nivel: number }) {
    const userId = req.user?.sub || req.user?.id;
    await this.completarNivelCamino.execute(userId, body.nivel);
    return { success: true };
  }
}
