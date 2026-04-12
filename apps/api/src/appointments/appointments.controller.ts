import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { CurrentClerkUser } from '../auth/current-clerk-user.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PatchAppointmentDto } from './dto/patch-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get('me')
  listMine(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.appointments.listMineConsumer(clerk.clerkUserId);
  }

  @Get('provider/me')
  listForProvider(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.appointments.listMineProvider(clerk.clerkUserId);
  }

  @Post()
  create(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointments.create(clerk.clerkUserId, dto);
  }

  @Patch(':appointmentId')
  patch(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Param('appointmentId') appointmentId: string,
    @Body() dto: PatchAppointmentDto,
  ) {
    return this.appointments.patch(clerk.clerkUserId, appointmentId, dto);
  }
}
