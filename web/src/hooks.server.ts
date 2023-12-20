import { sequence } from '@sveltejs/kit/hooks'
import { handleAuth } from './hooks/handleAuth'
import { handleContext } from './hooks/handleContext'

export const handle = sequence(handleAuth, handleContext)
