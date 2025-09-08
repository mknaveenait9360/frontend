import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';


export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

// Fetch products with optional filter
interface FetchProductsArgs {
  filterKey?: 'name' | 'price' | 'stock';
  filterValue?: string;
}

export const fetchProducts = createAsyncThunk<
  Product[],
  FetchProductsArgs | void,
  { state: RootState; rejectValue: string }
>(
  'products/fetchProducts',
  async (args, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    let url = 'http://localhost:3000/products';
    if (args?.filterKey && args?.filterValue) {
      url += `?${args.filterKey}=${args.filterValue}`;
    }

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch products');
      return data;
    } catch (error: unknown) {
      if(error instanceof Error){
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Network error');
    }
  }
);



// Create product
export const createProduct = createAsyncThunk<
  Product,
  { name: string; price: number; stock: number; images?: File[] },
  { state: RootState; rejectValue: string }
>('products/createProduct', async ({ name, price, stock, images }, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price.toString());
    formData.append('stock', stock.toString());
    images?.forEach((file) => formData.append('images', file));

    const response = await fetch('http://localhost:3000/products/create-multi', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to create product');
    return data;
  } catch (error: unknown) {
    if(error instanceof Error){
      return rejectWithValue(error.message)
    }
    return rejectWithValue('Network error');
  }
});

// Delete product
export const deleteProduct = createAsyncThunk<number, number, { state: RootState; rejectValue: string }>(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return rejectWithValue('Failed to delete product');
      return id;
    } catch (error: unknown) {
      if(error instanceof Error){
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Network error');
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk<
  Product,
  { id: number; data: Partial<Product> },
  { state: RootState; rejectValue: string }
>('products/updateProduct', async ({ id, data }, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });

    const updated = await response.json();
    if (!response.ok) return rejectWithValue(updated.message || 'Failed to update product');
    return updated;
  } catch (error: unknown) {
    if(error instanceof Error){
      return rejectWithValue(error.message)
    }
    return rejectWithValue('Network error');
  }
});

// Update product images
export const updateProductImages = createAsyncThunk<
  Product,
  { id: number; existingImages: string[]; imagesToDelete: string[]; newImages?: File[] },
  { state: RootState; rejectValue: string }
>('products/updateProductImages', async ({ id, existingImages, imagesToDelete, newImages }, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const formData = new FormData();
    formData.append('existingImages', JSON.stringify(existingImages));
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    newImages?.forEach((file) => formData.append('images', file));

    const response = await fetch(`http://localhost:3000/products/${id}/images`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to update images');
    return data;
  } catch (error: unknown) {
    if(error instanceof Error){
      return rejectWithValue(error.message)
    }
    return rejectWithValue('Network error');
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts(state) {
      state.products = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch products';
    });

    // createProduct
    builder.addCase(createProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
      state.loading = false;
      state.products.push(action.payload);
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create product';
    });

    // deleteProduct
    builder.addCase(deleteProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.products = state.products.filter((p) => p.id !== action.payload);
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to delete product';
    });

    // updateProduct
    builder.addCase(updateProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
      state.loading = false;
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.products[index] = action.payload;
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update product';
    });

    // updateProductImages
    builder.addCase(updateProductImages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProductImages.fulfilled, (state, action: PayloadAction<Product>) => {
      state.loading = false;
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.products[index] = action.payload;
    });
    builder.addCase(updateProductImages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update product images';
    });
  },
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
export const selectProducts = (state: RootState) => state.products;
