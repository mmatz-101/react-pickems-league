"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormDescription,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { CurrentWeekSchema } from "@/schema/current-week-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import * as z from "zod";
// import { FormSuccess } from "../auth/form-success";
// import { FormError } from "../auth/form-error";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { CurrentWeekUpdate } from "@/server/actions/admin/current-week";

export default function CurrentWeekCard() {
  const form = useForm<z.infer<typeof CurrentWeekSchema>>({
    resolver: zodResolver(CurrentWeekSchema),
    defaultValues: {},
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { execute, status } = useAction(CurrentWeekUpdate, {
    // onSuccess(data) {
    //   if (data?.error) {
    //     setError(data.error);
    //   }
    //   if (data?.success) {
    //     setSuccess(data.success);
    //   }
    // },
  });

  const OnSubmit = (values: z.infer<typeof CurrentWeekSchema>) => {
    execute(values);
  };
  return (
    <Card className="sm:col-span-1">
      <CardHeader className="pb-2">
        <CardDescription>This Week</CardDescription>
        <CardTitle className="text-4xl">Current Week Here</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(OnSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="currentWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Week</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSuccess message={success} />
              <FormError message={error} />
            </div>
            <Button
              type="submit"
              className={cn("", status === "executing" ? "animate-pulse" : "")}
            >
              {"Update Week"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}