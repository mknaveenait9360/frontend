'use client';
import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Grid,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  images?: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState<'name' | 'price' | 'stock' | ''>('');
  const [filterValue, setFilterValue] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const token = localStorage.getItem('token'); // JWT token for auth

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:3000/products';
      if (filterType && filterValue) {
        url += `?${filterType}=${filterValue}`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
      showMessage('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Multiple file select
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Create product
  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('stock', stock);
      files.forEach((file) => formData.append('images', file));

      const res = await fetch('http://localhost:3000/products/create-multi', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showMessage('Product created successfully!', 'success');
        resetForm();
        fetchProducts();
      } else {
        showMessage(data.message || 'Failed to create product', 'error');
      }
    } catch (error) {
      console.error(error);
      showMessage('Something went wrong while creating product', 'error');
    }
  };

  // Update product
  const handleUpdate = async () => {
    if (!editingProductId) return;

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('stock', stock);
      files.forEach((file) => formData.append('images', file));

      const res = await fetch(`http://localhost:3000/products/${editingProductId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showMessage('Product updated successfully!', 'success');
        resetForm();
        fetchProducts();
      } else {
        showMessage(data.message || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error(error);
      showMessage('Something went wrong while updating product', 'error');
    }
  };

  // Delete product
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('Product deleted successfully!', 'success');
        fetchProducts();
      } else {
        showMessage(data.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error(error);
      showMessage('Something went wrong while deleting product', 'error');
    }
  };

  // Populate form for edit
  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setFiles([]);
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setPrice('');
    setStock('');
    setFiles([]);
    setEditingProductId(null);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>

      {/* Filter Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={filterType}
                label="Filter By"
                onChange={(e) =>
                  setFilterType(e.target.value as 'name' | 'price' | 'stock' | '')
                }
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Filter Value"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />

            <Button variant="contained" onClick={fetchProducts}>
              Apply
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Create / Edit Product Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editingProductId ? 'Edit Product' : 'Create New Product'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                Select Images
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>
            </Grid>

            {/* Image Preview */}
            {files.length > 0 && (
              <Grid item xs={12}>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {files.map((file, index) => (
                    <Box key={index} position="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={editingProductId ? handleUpdate : handleCreate}
              >
                {editingProductId ? 'Update Product' : 'Create Product'}
              </Button>
              {editingProductId && (
                <Button sx={{ ml: 2 }} onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Product List
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : products.length === 0 ? (
            <Typography>No products found.</Typography>
          ) : (
            products.map((product) => (
              <Box
                key={product.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography>
                  {product.name} - ${product.price} - Stock: {product.stock}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    sx={{ mr: 1 }}
                    onClick={() => handleEditClick(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
