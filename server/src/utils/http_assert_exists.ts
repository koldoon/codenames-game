import { NotFoundException } from '@nestjs/common';

export function httpAssertFound(value: any, message: string) {
    if (!value)
        throw new NotFoundException(message);
}
