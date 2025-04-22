import { SetMetadata } from '@nestjs/common';

export const isAuthorized = () => SetMetadata('isAuthorized', true);
