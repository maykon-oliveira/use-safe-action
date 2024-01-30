# usedSafeAction

> It's just a repository to expose [this implementation](https://www.youtube.com/watch?v=pRybm9lXW2c&t=20767s) as a npm library. Thanks [@AntonioErdeljac](https://github.com/AntonioErdeljac)!

Creates a typed and self validated action to be used as hook in Nextjs Client Component.

### How to use

First, create a [Next Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

```ts
'use server'

// import dependencies
import { type ActionState, createSafeAction } from "use-safe-action";
import { ContactFormInput } from "./schema";

type ReturnType = ActionState<ContactFormInput, string>

const handler = async (input: ContactFormInput): Promise<ReturnType> => {
    try {
        console.log(input)

        return {
            data: 'Success...'
        }

    } catch (error) {
        return {
            error: (error as Error).message
        }
    }
}

// export the action
export const sendContactEmail = createSafeAction(ContactFormInput, handler)

```

```ts
'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactFormInput } from "~/server/api/use-case/email/schema";
import { sendContactEmail } from "~/server/api/use-case/email/send-contact-email";
import { useToast } from "../ui/use-toast";
import { useAction } from "use-safe-action";

const ContactForm = () => {
    const { toast } = useToast();
    const form = useForm<ContactFormInput>({
        resolver: zodResolver(ContactFormInput)
    })
    // use the action
    const { execute, isLoading } = useAction(sendContactEmail, {
        onSuccess(data) {
            form.reset();

            toast({
                title: 'Sucess!',
                description: data,
                variant: 'success'
            })
        },
        onError(error) {
            toast({
                title: 'Error!',
                description: error,
                variant: 'destructive'
            })
        },
    });

    return ...;
}

export default ContactForm;
```