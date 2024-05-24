"use client"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export default function LoginPage() {
    // define login form
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })
    // define submit handler
    function onSubmit(values: z.infer<typeof loginSchema>) {
        console.log(values)
    }

    // actually builld the form
    return (
        <div>
            <Form {...form}>
                <form action="">
                    <FormField control={form.control} name="email" render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="email@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField control={form.control} name="password" render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="**********" {...field} />
                            </FormControl>
                            <FormDescription>Password minimum 8 characters.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">Create Account</Button>
                </form>
            </Form>
        </div>
    );
}

