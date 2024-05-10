"use server"

import { db } from "@/server"
import {users} from "@/server/schema"
import { eq } from "drizzle-orm"
import { emailTokens, passwordResetTokens } from "../schema"

export const getVerificationTokenByEmail = async(email: string) => {
    try {
        const verificationToken = await db.query.emailTokens.findFirst({
            where: eq(emailTokens.token, email)
        })
        return verificationToken
    } catch (error) {
        return null
    }
}

export const generateEmailVerificationToken = async(email: string) => {
    const token = crypto.randomUUID()
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)

    const existingToken = await getVerificationTokenByEmail(email)
    if (existingToken){
        await db.delete(emailTokens).where(eq(emailTokens.id, existingToken.id))
    }

    const verificationToken = await db.insert(emailTokens).values({
        id: crypto.randomUUID(), 
        email,
        token,
        expires,
    }).returning()
    return verificationToken
}

export const newVerification = async (token:string) => {
    const existingToken = await getVerificationTokenByEmail(token);
    if (!existingToken) {
        return {
            error: "Token not found"
        }
    }
    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) {
        return {
            error:"Token has expired"
        }
    }

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, existingToken.email)
    })
    if (!existingUser) {
        return {
            error: "User not found"
        }
    }
    await db.update(users).set({
        emailVerified: new Date (),
        email: existingToken.email,
    })

    await db.delete(emailTokens).where(eq(emailTokens.id, existingToken.id))

    return {success: "Email verified"}
}

export const getPasswordResetTokenByToken = async(token: string) =>{
    try {

    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.token, token)
    })
    return passwordResetToken
    } catch(error){
        return null

    }
}

export const getPasswordResetTokenByEmail = async(email: string) => {
    try {
        const passwordResetToken = await db.query.passwordResetTokens.findFirst({
            where: eq(passwordResetTokens.email, email)
        })
        return passwordResetToken
    } catch (error) {
        return null
    }
}

export const generatePasswordResetToken = async(email: string) => {
    try {

    const token = crypto.randomUUID()
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
    const existingToken = await getPasswordResetTokenByEmail(email)

    if (existingToken) {
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, existingToken.id))
    }
    const passwordResetToken = await db.insert(passwordResetTokens).values({
        id: crypto.randomUUID(),
        email,
        token,
        expires,
    }).returning()
    return passwordResetToken
    } catch (error) {
        return null
    }
}