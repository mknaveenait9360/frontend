'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  CssBaseline,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { Poppins } from 'next/font/google';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '../store/store';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  updateProductImages,
  deleteProduct,
  selectProducts,
} from '../store/productsSlice';
import { setToken } from '../store/authSlice';

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });
const theme = createTheme({ typography: { fontFamily: `'${poppins.style.fontFamily}', sans-serif` } });

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { products, loading } = useSelector(selectProducts);
  const { token } = useSelector((state: RootState) => state.auth);

  const [mounted, setMounted] = useState(false);

  // Form states
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Filters
  const [activeFilter, setActiveFilter] = useState<'name' | 'price' | 'stock'>('name');
  const [filterValue, setFilterValue] = useState('');

  // --- Client Mount ---
  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      // Restore token
      const localToken = localStorage.getItem('token');
      if (localToken && !token) dispatch(setToken(localToken));

      // Restore filters
      const savedFilter = sessionStorage.getItem('activeFilter') as 'name'|'price'|'stock';
      const savedValue = sessionStorage.getItem('filterValue') || '';
      if (savedFilter) setActiveFilter(savedFilter);
      if (savedValue) setFilterValue(savedValue);
    }
  }, [dispatch, token]);

  // --- Protected route ---
  useEffect(() => {
    if (mounted && !token) router.replace('/login');
  }, [mounted, token, router]);

  // --- Persist filters ---
  useEffect(() => { if (mounted) sessionStorage.setItem('activeFilter', activeFilter); }, [activeFilter, mounted]);
  useEffect(() => { if (mounted) sessionStorage.setItem('filterValue', filterValue); }, [filterValue, mounted]);

  const loadProducts = (key = activeFilter, value = filterValue) => {
    if (!token) return;
    dispatch(fetchProducts(value ? { filterKey: key, filterValue: value } : undefined));
  };

  useEffect(() => { if (mounted && token) loadProducts(); }, [mounted, token]);

  const resetForm = () => {
    setEditingProductId(null);
    setName('');
    setPrice('');
    setStock('');
    setExistingImages([]);
    setImagesToDelete([]);
    setNewImages([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setExistingImages(product.images || []);
    setImagesToDelete([]);
    setNewImages([]);
  };

  const handleRemoveExistingImage = (img: string) => {
    setExistingImages(existingImages.filter(i => i !== img));
    setImagesToDelete([...imagesToDelete, img]);
  };

  const handleRemoveNewImage = (idx: number) => {
    const updated = [...newImages];
    updated.splice(idx, 1);
    setNewImages(updated);
  };

  const handleAddNewImages = (files: FileList | null) => {
    if (!files) return;
    setNewImages([...newImages, ...Array.from(files)]);
  };

  const handleSubmit = async () => {
    try {
      if (editingProductId !== null) {
        await dispatch(updateProduct({ id: editingProductId, data: { name, price: Number(price), stock: Number(stock) } })).unwrap();
        if (newImages.length > 0 || imagesToDelete.length > 0) {
          await dispatch(updateProductImages({ id: editingProductId, existingImages, imagesToDelete, newImages })).unwrap();
        }
      } else {
        await dispatch(createProduct({ name, price: Number(price), stock: Number(stock), images: newImages })).unwrap();
      }
      resetForm();
      loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'price', headerName: 'Price', flex: 1 },
    { field: 'stock', headerName: 'Stock', flex: 1 },
    {
      field: 'images',
      headerName: 'Images',
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1} flexWrap="wrap">
          {params.value?.map((img: string, idx: number) => (
            <img
              key={idx}
              src={`http://localhost:3000/uploads/products/${img}`}
              alt={`img-${idx}`}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleEdit(params.row as Product)}><EditIcon /></IconButton>
          <IconButton color="error" onClick={() => handleDelete((params.row as Product).id)}><DeleteIcon /></IconButton>
        </Box>
      ),
    },
  ];

  // --- Do not render until mounted ---
  if (!mounted) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 6 }} className={poppins.className}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Product Management</Typography>

        {/* Filter */}
        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }} elevation={3}>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Filter By</InputLabel>
            <Select
              value={activeFilter}
              label="Filter By"
              onChange={(e) => { setActiveFilter(e.target.value as 'name'|'price'|'stock'); setFilterValue(''); }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="stock">Stock</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={`Filter ${activeFilter}`}
            value={filterValue}
            type={activeFilter === 'name' ? 'text' : 'number'}
            onChange={(e) => setFilterValue(e.target.value)}
          />

          <Button variant="contained" onClick={() => loadProducts()} sx={{ backgroundColor: '#f5a40eff', color: 'white', '&:hover': { backgroundColor: '#45A049' } }}>Apply</Button>
          <Button variant="outlined" onClick={() => { setFilterValue(''); loadProducts(); }} sx={{ borderColor:'#f44336', color:'#f44336' }}>Reset</Button>
        </Paper>

        {/* Form */}
        <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
          <Typography variant="h6" fontWeight="medium" mb={2}>{editingProductId !== null ? 'Edit Product' : 'Create New Product'}</Typography>

          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <TextField label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </Box>

          {editingProductId !== null && existingImages.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {existingImages.map((img, idx) => (
                <Box key={idx} position="relative">
                  <img src={`http://localhost:3000/uploads/products/${img}`} alt={`img-${idx}`} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <IconButton size="small" sx={{ position:'absolute', top:-5, right:-5, backgroundColor:'error.main', color:'white', '&:hover':{backgroundColor:'error.dark'} }} onClick={() => handleRemoveExistingImage(img)}>
                    <CloseIcon fontSize="small"/>
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {newImages.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {newImages.map((file, idx) => (
                <Box key={idx} position="relative">
                  <img src={URL.createObjectURL(file)} alt={file.name} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <IconButton size="small" sx={{ position:'absolute', top:-5, right:-5, backgroundColor:'error.main', color:'white', '&:hover':{backgroundColor:'error.dark'} }} onClick={() => handleRemoveNewImage(idx)}>
                    <CloseIcon fontSize="small"/>
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button variant="outlined" component="label" sx={{ borderColor:'#1976d2', color:'#1976d2', '&:hover':{borderColor:'#115293', backgroundColor:'rgba(25,118,210,0.04)'} }}>
              Select Images
              <input type="file" hidden multiple accept="image/*" onChange={(e) => handleAddNewImages(e.target.files)} />
            </Button>

            <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor:'#f5a40eff', color:'white', '&:hover':{backgroundColor:'#45A049'} }}>
              {editingProductId !== null ? 'Save Changes' : 'Create Product'}
            </Button>

            {editingProductId !== null && <Button variant="outlined" color="secondary" onClick={resetForm}>Cancel Edit</Button>}
          </Box>
        </Paper>

        {/* Product List */}
        <Paper sx={{ height: 500, width: '100%', p: 2 }} elevation={3}>
          <DataGrid
            rows={products}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
          
          />
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
