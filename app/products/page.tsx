'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  // Filters
  const [filterType, setFilterType] = useState<'name' | 'price' | 'stock' | ''>('');
  const [filterValue, setFilterValue] = useState('');

  // Edit state
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Hydration-safe sessionStorage loading
  useEffect(() => {
    setHasMounted(true);
    const storedType = sessionStorage.getItem('productFilterType') as 'name' | 'price' | 'stock' | '';
    const storedValue = sessionStorage.getItem('productFilterValue') || '';
    setFilterType(storedType || '');
    setFilterValue(storedValue || '');
  }, []);

  // Save filters to sessionStorage
  useEffect(() => {
    if (hasMounted) sessionStorage.setItem('productFilterType', filterType);
  }, [filterType, hasMounted]);

  useEffect(() => {
    if (hasMounted) sessionStorage.setItem('productFilterValue', filterValue);
  }, [filterValue, hasMounted]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:3000/products';
      if (filterType && filterValue) {
        url += `?${filterType}=${filterValue}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMounted) fetchProducts();
  }, [hasMounted]);

  const clearFilters = () => {
    setFilterType('');
    setFilterValue('');
    sessionStorage.removeItem('productFilterType');
    sessionStorage.removeItem('productFilterValue');
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setExistingImages(product.images || (product.image ? [product.image] : []));
    setImagesToDelete([]);
    setEditFiles([]);
  };

  const resetEdit = () => {
    setEditingProductId(null);
    setEditName('');
    setEditPrice('');
    setEditStock('');
    setEditFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
  };

  const handleSaveEdit = async () => {
    if (!editingProductId) return;

    try {
      // Update basic product info
      await fetch(`http://localhost:3000/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name: editName, price: Number(editPrice), stock: Number(editStock) }),
      });

      // Update images if necessary
      if (editFiles.length > 0 || imagesToDelete.length > 0) {
        const formData = new FormData();
        const imagesToKeep = existingImages.filter(img => !imagesToDelete.includes(img));
        formData.append('existingImages', JSON.stringify(imagesToKeep));
        editFiles.forEach(file => formData.append('images', file));

        await fetch(`http://localhost:3000/products/${editingProductId}/images`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });
      }

      resetEdit();
      fetchProducts();
    } catch (err) {
      console.error('Error updating product', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  if (!hasMounted) return null; // prevent SSR hydration errors

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'price', headerName: 'Price', width: 100 },
    { field: 'stock', headerName: 'Stock', width: 100 },
    {
      field: 'images',
      headerName: 'Images',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const imgs = params.value || (params.row.image ? [params.row.image] : []);
        return (
          <Box display="flex" gap={1} flexWrap="wrap">
            {imgs.map((img: string, idx: number) => (
              <img
                key={idx}
                src={`http://localhost:3000/uploads/products/${img}`}
                alt={`product ${idx}`}
                width={50}
                height={50}
                style={{ objectFit: 'cover', borderRadius: 4 }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>

      {/* Filter */}
      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter By</InputLabel>
          <Select
            value={filterType}
            label="Filter By"
            onChange={(e) => setFilterType(e.target.value as 'name' | 'price' | 'stock' | '')}
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
          disabled={!filterType}
        />
        <Button variant="contained" onClick={fetchProducts}>Apply Filter</Button>
        <Button variant="outlined" onClick={clearFilters}>Clear</Button>
      </Box>

      {/* Edit Form */}
      {editingProductId && (
        <Box mb={2} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6">Edit Product</Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
            <TextField label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <TextField label="Price" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            <TextField label="Stock" value={editStock} onChange={(e) => setEditStock(e.target.value)} />

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                {existingImages.map((img, idx) => (
                  <Box key={idx} position="relative">
                    <img
                      src={`http://localhost:3000/uploads/products/${img}`}
                      alt={img}
                      width={50}
                      height={50}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: -4, right: -4, backgroundColor: 'error.main', color: 'white' }}
                      onClick={() => {
                        setExistingImages(existingImages.filter(i => i !== img));
                        setImagesToDelete([...imagesToDelete, img]);
                      }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Add new images */}
            <Button variant="outlined" component="label">
              Add Images
              <input type="file" hidden multiple accept="image/*" onChange={(e) => e.target.files && setEditFiles([...editFiles, ...Array.from(e.target.files)])} />
            </Button>

            {/* New Images Preview */}
            {editFiles.length > 0 && (
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                {editFiles.map((file, idx) => (
                  <Box key={idx} position="relative">
                    <img src={URL.createObjectURL(file)} alt={file.name} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: -4, right: -4, backgroundColor: 'error.main', color: 'white' }}
                      onClick={() => setEditFiles(editFiles.filter((_, i) => i !== idx))}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box mt={2}>
            <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
            <Button variant="outlined" onClick={resetEdit} sx={{ ml: 1 }}>Cancel</Button>
          </Box>
        </Box>
      )}

      {/* DataGrid */}
      <div style={{ height: 500, width: '100%' }}>
  <DataGrid
    rows={products}
    columns={columns}
    loading={loading}
    getRowId={(row) => row.id}
    pagination
    paginationMode="client" // client-side pagination
    pageSizeOptions={[5, 10, 20]}
    paginationModel={paginationModel}
    onPaginationModelChange={setPaginationModel}
  />
</div>
    </Container>
  );
}
