"use server"

import {z} from 'zod'
import { loginSchema } from './schema'
import { action } from '@/lib/safe-actions'
import { createClient } from '@/utils/supabase/server'


export const loginUser = action(loginSchema, async ({email, password}) => {
    const supabase = createClient();

    const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return {error: "Could not authenticate user."}
    }

    return {success: "User authenticated successfully."}
})