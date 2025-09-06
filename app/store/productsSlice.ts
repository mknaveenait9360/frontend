import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Product type
export interface Product {
  id: number;  // <-- must be number
  name: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
}

// State type
interface ProductsState {
  list: Product[];
  loading: boolean;
  filterType: 'name' | 'price' | 'stock' | '';
  filterValue: string;
}

const initialState: ProductsState = {
  list: [],
  loading: false,
  filterType: '',
  filterValue: '',
};

// ------------------ Thunks ------------------

// Fetch all products (with optional filter)
export const fetchProductsAsync = createAsyncThunk<
  Product[],
  { filterType?: string; filterValue?: string }
>('products/fetch', async ({ filterType, filterValue }) => {
  let url = 'http://localhost:3000/products';
  if (filterType && filterValue) url += `?${filterType}=${filterValue}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return (await res.json()) as Product[];
});

// Create new product
export const createProductAsync = createAsyncThunk<
  Product,
  FormData,
  { rejectValue: string }
>('products/createProduct', async (formData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/products/create-multi', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return rejectWithValue(errorData.message);
    }

    const data = await res.json();
    // Make sure id is a number
    const product: Product = { ...data, id: Number(data.id) };
    return product;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Update product
export const updateProductAsync = createAsyncThunk<
  Product,
  { id: number; data: FormData }
>('products/update', async ({ id, data }) => {
  const res = await fetch(`http://localhost:3000/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: data,
  });
  const updated = await res.json();
  return { ...updated, id: Number(updated.id) }; // <-- ensure number
});

// Delete product
export const deleteProductAsync = createAsyncThunk<number, number>(
  'products/delete',
  async (id) => {
    await fetch(`http://localhost:3000/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return id;
  }
);

// ------------------ Slice ------------------
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilterType: (state, action: PayloadAction<'name' | 'price' | 'stock' | ''>) => {
      state.filterType = action.payload;
    },
    setFilterValue: (state, action: PayloadAction<string>) => {
      state.filterValue = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createProductAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProductAsync.fulfilled, (state, action: PayloadAction<Product>) => {
        state.list.push(action.payload);
        state.loading = false;
      })
      .addCase(createProductAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateProductAsync.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action: PayloadAction<number>) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export const { setFilterType, setFilterValue } = productsSlice.actions;
export default productsSlice.reducer;
