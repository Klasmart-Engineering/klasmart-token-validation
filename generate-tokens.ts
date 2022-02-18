import { generateTestToken } from './generate-test-token'
import { randomName } from './random'

const url = new URL('https://live.research.kidsloop.live/')

for (let i = 0; i < 8; i++) {
  const name = randomName()
  const {
    authenticationToken,
    authorizationToken
  } = generateTestToken({ name })

  url.searchParams.set('authenticaton', authenticationToken)
  url.searchParams.set('token', authorizationToken)
  url.searchParams.set('selectionStrategy', 'random')

  console.log(`Link for ${name}: ${url}`)
}
