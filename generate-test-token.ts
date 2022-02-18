/* eslint-disable camelcase */
import { Secret, sign, SignOptions } from 'jsonwebtoken'

export type TokenParameters = {
    userId?: string,
    email?: string,
    name?: string,
    roomId?: string,
    isTeacher?: boolean,
    organizationId?: string,
    durationSeconds?: number,
    classtype?: string,
    materials?: unknown[],
};

export function generateTestToken (
  {
    name = `Test User ${Math.floor(Math.random() * 100)}`,
    userId = 'a36b0ea3-84d6-45a1-bf12-12d056487388',
    email = 'debu@kidsloop.live',
    roomId = 'test-room',
    isTeacher = false,
    organizationId = '8e617f1a-0fda-432a-9823-9e75b1818763',
    durationSeconds = 15 * 60,
    classtype = 'live',
    materials = defaultMaterials
  }: TokenParameters,
  signOptions: SignOptions = {
    issuer: 'calmid-debug',
    expiresIn: durationSeconds,
    algorithm: 'HS256'
  },
  secretOrPrivateKey: Secret = 'iXtZx1D5AqEB0B9pfn+hRQ=='
) {
  const authenticationPayload = {
    id: userId,
    email: email
  }

  const authorizationPayload = {
    name,
    schedule_id: roomId,
    user_id: userId,
    type: classtype,
    teacher: isTeacher,
    roomid: roomId,
    materials,
    classtype,
    org_id: organizationId
  }

  const authenticationToken = sign(authenticationPayload, secretOrPrivateKey, signOptions)
  const authorizationSignOptions = Object.assign<SignOptions, SignOptions>({ audience: 'kidsloop-live', subject: 'authorization' }, signOptions)
  const authorizationToken = sign(authorizationPayload, secretOrPrivateKey, authorizationSignOptions)

  return {
    authenticationToken,
    authorizationToken
  }
}

export const defaultMaterials = [
  {
    id: '5ffc023d2a76fe69ee81d34e',
    name: 'BGF1: L19 - ABC Nemies Activity 3 m',
    url: '/h5p/play/5fc5e66031cbee0013f87787',
    __typename: 'Iframe'
  },
  {
    id: '5fc5e5bd375508abeafa2c45',
    name: '04_Meerkats_360 Video',
    url: '/h5p/play/5fc5e5b431cbee0013f87785',
    __typename: 'Iframe'
  },
  {
    id: '5fc5e5521634b0ce013751b1',
    name: 'BGF1: L22 - My Vocabulary Activity 2',
    url: '/h5p/play/5fc5e54c31cbee0013f87783',
    __typename: 'Iframe'
  },
  {
    id: '5fc5e1711c57f6b7c7811d40',
    name: 'The Rainbow Weather Team Memory Game',
    url: '/h5p/play/5fc5e16d31cbee0013f8777c',
    __typename: 'Iframe'
  }
]
