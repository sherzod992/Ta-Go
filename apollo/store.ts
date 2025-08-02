import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import { MemberAuthType } from '../libs/enums/member.enum';

export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload | null>(null);

//@ts-ignore
export const socketVar = makeVar<WebSocket>();