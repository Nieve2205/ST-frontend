import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category_id: z.string(),
  price: z.number(),
  description: z.string(),
  imagen_url: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export interface CreateProductPayload {
  name: string;
  category_id: string;
  price: number;
  description: string;
  imagen_url: string;
}

export interface UpdateProductPayload {
  name: string;
  category_id: string;
  price: number;
  description: string;
  imagen_url: string;
}