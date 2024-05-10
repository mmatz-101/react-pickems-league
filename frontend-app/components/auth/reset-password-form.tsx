"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { AuthCard } from "./auth-card";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";
import { ResetPasswordSchema } from "@/types/reset-password-schema";
import { resetPassword } from "@/server/actions/reset-password";

export const ResetPasswordForm = () => {
  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const [error, setError ] = useState("");
  const [success, setSuccess ] = useState("");
  const { execute,status } = useAction(resetPassword, {
    onSuccess(data){
      if (data?.error) {
        setError(data.error);
      }
      if (data?.success) {
        setSuccess(data.success)
      }
    }
  });

  const OnSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    execute(values)
  };
  return (
    <AuthCard
      cardTitle="Enter your email"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      showSocials
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(OnSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="email@email.com"
                        type="email"
                        autoComplete="email"
                        disabled={status==="executing"}
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button size={"sm"} variant={"link"}>
                <Link href={"/auth/reset"}>Forgot your password</Link>
              </Button>
            </div>
            <Button
              type="submit"
              className={cn(
                "w-full my-2",
                status === "executing" ? "animate-pulse" : ""
              )}
            >
              {"Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  );
};
