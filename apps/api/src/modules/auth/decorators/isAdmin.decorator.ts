import { SetMetadata } from '@nestjs/common';

export const isAdmin = () => SetMetadata('isAdmin', true);
