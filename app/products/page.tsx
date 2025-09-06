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
  CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { Poppins } from 'next/font/google';
const poppins = Poppins({ weight: ['400','500','600','700'], subsets: ['latin'] });

const theme = createTheme({
  typography: {
    fontFamily: `'${poppins.style.fontFamily}', sans-serif`,
  },
});

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);


  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);


  const [activeFilter, setActiveFilter] = useState<'name' | 'price' | 'stock'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('activeFilter') as 'name' | 'price' | 'stock') || 'name';
    }
    return 'name';
  });
  const [filterValue, setFilterValue] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('filterValue') || '';
    }
    return '';
  });


  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeFilter', activeFilter);
    }
  }, [activeFilter]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('filterValue', filterValue);
    }
  }, [filterValue]);

  // Fetch products
  const fetchProducts = async (filterVal = filterValue) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (filterVal) queryParams.append(activeFilter, filterVal);

      const res = await fetch(`http://localhost:3000/products?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
    setExistingImages(existingImages.filter((i) => i !== img));
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
      if (editingProductId) {
        await fetch(`http://localhost:3000/products/${editingProductId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            name,
            price: Number(price),
            stock: Number(stock),
          }),
        });

        if (newImages.length > 0 || imagesToDelete.length > 0) {
          const formData = new FormData();
          formData.append('existingImages', JSON.stringify(existingImages));
          formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
          newImages.forEach((file) => formData.append('images', file));

          const imgRes = await fetch(
            `http://localhost:3000/products/${editingProductId}/images`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              body: formData,
            }
          );

          if (!imgRes.ok) {
            alert('Product updated but image changes failed.');
          }
        }
      } else {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('stock', stock);
        newImages.forEach((file) => formData.append('images', file));

        const res = await fetch('http://localhost:3000/products/create-multi', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });

        if (!res.ok) throw new Error('Failed to create product');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
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
          {params.value.map((img: string, idx: number) => (
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
          <IconButton color="primary" onClick={() => handleEdit(params.row as Product)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 6 }} className={poppins.className}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Product Management
        </Typography>

        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }} elevation={3}>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Filter By</InputLabel>
            <Select
              value={activeFilter}
              label="Filter By"
              onChange={(e) => {
                setActiveFilter(e.target.value as 'name' | 'price' | 'stock');
                setFilterValue('');
              }}
              sx={{fontSize : '0.8rem'}}
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
            sx={{fontSize : '0.8rem'}}
          />

          <Button
              variant="contained"
              onClick={() => fetchProducts(filterValue)}
              sx={{ backgroundColor: '#f5a40eff', color: 'white', '&:hover': { backgroundColor: '#45A049' } }} 
            >
              Apply
            </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setFilterValue('');
              fetchProducts('');
            }}
            sx={{ borderColor: '#f44336', color: '#f44336', '&:hover': { borderColor: '#d32f2f', color: '#d32f2f' } }}
          >
            Reset
          </Button>
        </Paper>

       
        <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
          <Typography variant="h6" fontWeight="medium" mb={2}>
            {editingProductId ? 'Edit Product' : 'Create New Product'}
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <TextField label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </Box>

          {editingProductId && existingImages.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {existingImages.map((img, idx) => (
                <Box key={idx} position="relative">
                  <img
                    src={`http://localhost:3000/uploads/products/${img}`}
                    alt={`img-${idx}`}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'error.dark' },
                    }}
                    onClick={() => handleRemoveExistingImage(img)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {newImages.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {newImages.map((file, idx) => (
                <Box key={idx} position="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'error.dark' },
                    }}
                    onClick={() => handleRemoveNewImage(idx)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
                variant="outlined"
                component="label"
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#115293',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                Select Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => handleAddNewImages(e.target.files)}
                />
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ backgroundColor: '#f5a40eff', color: 'white', '&:hover': { backgroundColor: '#45A049' } }} 
            >
              {editingProductId ? 'Save Changes' : 'Create Product'}
            </Button>

            {editingProductId && (
              <Button variant="outlined" color="secondary" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </Box>
        </Paper>


        <Paper sx={{ height: 500, width: '100%', p: 2 }} elevation={3}>
          <DataGrid rows={products} columns={columns} getRowId={(row) => row.id} loading={loading} />
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
