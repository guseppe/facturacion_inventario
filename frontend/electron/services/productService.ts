import { db } from '../db';
import { products, productRecipes } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function getProductsService() {
  const allProducts = await db.select().from(products).where(eq(products.isActive, true));
  
  // Attach recipes to composites
  const productsWithRecipes = [];
  for (const product of allProducts) {
    if (product.type === 'COMPOSITE') {
      const recipes = await db.select({
        id: productRecipes.id,
        componentProductId: productRecipes.componentProductId,
        quantity: productRecipes.quantity,
      }).from(productRecipes).where(eq(productRecipes.compositeProductId, product.id));
      productsWithRecipes.push({ ...product, recipes });
    } else {
      productsWithRecipes.push({ ...product, recipes: [] });
    }
  }
  
  return productsWithRecipes;
}

export async function createProductService(productData: any) {
  const { recipes, ...data } = productData;
  const id = crypto.randomUUID();
  
  const result = db.transaction((tx) => {
    const newProduct = tx.insert(products).values({ id, ...data }).returning().get();
    
    if (data.type === 'COMPOSITE' && recipes && recipes.length > 0) {
      for (const r of recipes) {
        tx.insert(productRecipes).values({
          id: crypto.randomUUID(),
          compositeProductId: id,
          componentProductId: r.componentProductId,
          quantity: r.quantity
        }).run();
      }
    }
    
    return newProduct;
  });
  
  return result;
}

export async function updateProductService(id: string, productData: any) {
  const { recipes, ...data } = productData;
  
  const result = db.transaction((tx) => {
    const updatedProduct = tx.update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning().get();
      
    // Update recipes if composite
    if (updatedProduct.type === 'COMPOSITE') {
      // Simplest approach: delete existing and recreate
      tx.delete(productRecipes).where(eq(productRecipes.compositeProductId, id)).run();
      if (recipes && recipes.length > 0) {
        for (const r of recipes) {
          tx.insert(productRecipes).values({
            id: crypto.randomUUID(),
            compositeProductId: id,
            componentProductId: r.componentProductId,
            quantity: r.quantity
          }).run();
        }
      }
    } else {
      // If it changed type from COMPOSITE to something else, clear recipes
      tx.delete(productRecipes).where(eq(productRecipes.compositeProductId, id)).run();
    }
    
    return updatedProduct;
  });
  
  return result;
}

export async function deleteProductService(id: string) {
  const deletedProduct = await db.update(products)
    .set({ isActive: false })
    .where(eq(products.id, id))
    .returning();
  return deletedProduct[0];
}
