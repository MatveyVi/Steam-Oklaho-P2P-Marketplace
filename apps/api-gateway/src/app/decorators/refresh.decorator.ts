import { UseGuards } from '@nestjs/common';
import { RefreshAuthGuard } from '../../guards/jwt-refresh.guard';

export const Refresh = () => UseGuards(RefreshAuthGuard);
