import { Avaria } from "@/types/consults";
import z from "zod";

const schema = z.object({
  
})

export type AvariaSchema = z.infer<typeof schema>

export const initValues = (data: Avaria): AvariaSchema => ({

})