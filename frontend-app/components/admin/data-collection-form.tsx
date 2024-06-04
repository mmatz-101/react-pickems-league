"use client";

import { Button } from "@/components/ui/button";
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { DataCollectionSchema } from "@/schema/data-collection-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { FormSuccess } from "@/components/form/form-success";
import { FormError } from "@/components/form/form-error";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { DataCollection } from "@/server/actions/admin/data-collection";
import { cn } from "@/lib/utils";

export default function DataCollectionForm() {
  const form = useForm<z.infer<typeof DataCollectionSchema>>({
    resolver: zodResolver(DataCollectionSchema),
    defaultValues: {},
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { execute, status } = useAction(DataCollection, {
    onSuccess(data) {
      if (data?.error) {
        setError(data.error);
      }
      if (data?.success) {
        setSuccess(data.success);
      }
    },
  });

  const OnSubmit = (values: z.infer<typeof DataCollectionSchema>) => {
    execute(values);
  };
  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle>Update Database</CardTitle>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          Collect data from Oddshark API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(OnSubmit)}>
              <div>
                <FormField
                  control={form.control}
                  name="league"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>League</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="NFL/NCAAF" />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="2023" />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="1" />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Week</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="1" />
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
                className={cn(
                  "w-full my-2",
                  status === "executing" ? "animate-pulse" : ""
                )}
              >
                {"Update Database"}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
