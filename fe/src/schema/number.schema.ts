import * as z from "zod";

const phoneSchema = z.string()
    .min(10, "Phone number must have at least 10 digits")
    .max(13, "Phone number must have at most 13 digits")
    .startsWith("0", "Phone number must start with 0")
    .regex(/^0(3|5|7|8|9)\d{8}$/, {
        message: "Invalid phone number (must be 10 digits and correct prefix)",
    });


export { phoneSchema };