import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPackage, FiSearch, FiPlus, FiEdit2, FiTrash2,
  FiSave, FiX, FiRefreshCw, FiDollarSign, FiCheckCircle,
  FiAlertCircle, FiInfo, FiFilter
} from 'react-icons/fi';
import { BsBoxSeam, BsCurrencyRupee } from 'react-icons/bs';
import {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  searchMaterials
} from '../../../api/adminMaterialApi';
import './AdminMaterial.css';
import Sidebar from '../../../components/Sidebar/Sidebar';

const AdminMaterial = () => {
  const navigate = useNavigate();
  
  // States
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [showUnitFilter, setShowUnitFilter] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'piece'
  });

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  // Units
  const units = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'meter', label: 'Meter' },
    { value: 'feet', label: 'Feet' },
    { value: 'inch', label: 'Inch' },
    { value: 'liter', label: 'Liter' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' }
  ];

  // Get unique units from materials
  const getUniqueUnits = () => {
    const unitsSet = new Set(materials.map(m => m.unit));
    return Array.from(unitsSet).sort();
  };

  // Toast functions
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Load materials
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Filter materials based on search and unit
  useEffect(() => {
    let filtered = materials;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply unit filter
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(m => m.unit === selectedUnit);
    }

    setFilteredMaterials(filtered);
  }, [searchTerm, selectedUnit, materials]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await getAllMaterials({ limit: 100 });
      if (response.success) {
        setMaterials(response.data);
        setFilteredMaterials(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load materials');
      showToast('Failed to load materials', 'error');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMaterials();
    showToast('Materials refreshed successfully', 'info');
  };

  // Filter handlers
  const handleUnitFilter = (unit) => {
    setSelectedUnit(unit);
    showToast(`Filtered by: ${unit === 'all' ? 'All Units' : unit}`, 'info');
  };

  const clearFilters = () => {
    setSelectedUnit('all');
    setSearchTerm('');
    showToast('All filters cleared', 'info');
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Material name is required');
      showToast('Material name is required', 'error');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      showToast('Valid price is required', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const materialData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit
      };

      let response;
      if (editingMaterial) {
        response = await updateMaterial(editingMaterial._id, materialData);
      } else {
        response = await createMaterial(materialData);
      }

      if (response.success) {
        setShowModal(false);
        resetForm();
        await fetchMaterials();
        showToast(
          editingMaterial ? 'Material updated successfully!' : 'Material added successfully!',
          'success'
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to save material');
      showToast(err.message || 'Failed to save material', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', unit: 'piece' });
    setEditingMaterial(null);
    setError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      price: material.price.toString(),
      unit: material.unit
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Delete handlers
  const openDeleteModal = (material) => {
    setMaterialToDelete(material);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    
    setSubmitting(true);
    try {
      const response = await deleteMaterial(materialToDelete._id);
      if (response.success) {
        setShowDeleteModal(false);
        setMaterialToDelete(null);
        await fetchMaterials();
        showToast('Material deleted successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete material');
      showToast(err.message || 'Failed to delete material', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs ${Number(amount || 0).toFixed(2)}`;
  };

  const getUnitLabel = (unitValue) => {
    const unit = units.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  if (loading) {
    return (
      <div className="AdminMaterial">
        <div className="AdminMaterial-container">
          <Sidebar />
          <div className="AdminMaterial-content AdminMaterial-loading">
            <div className="AdminMaterial-spinner"></div>
            <h2>Loading Materials...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminMaterial">
      <div className="AdminMaterial-container">
        <Sidebar />
        
        <div className="AdminMaterial-content">
          {/* Toast Message */}
          {toast.show && (
            <div className={`AdminMaterial-toast AdminMaterial-toast-${toast.type}`}>
              <div className="AdminMaterial-toast-icon">
                {toast.type === 'success' && <FiCheckCircle />}
                {toast.type === 'error' && <FiAlertCircle />}
                {toast.type === 'info' && <FiInfo />}
                {toast.type === 'warning' && <FiAlertCircle />}
              </div>
              <div className="AdminMaterial-toast-message">{toast.message}</div>
              <button className="AdminMaterial-toast-close" onClick={hideToast}>
                <FiX />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="AdminMaterial-header">
            <div className="AdminMaterial-headerTitle">
              <h1>Materials / Products</h1>
              <p>Manage your materials and products</p>
            </div>
            
            <div className="AdminMaterial-headerActions">
              <button 
                className="AdminMaterial-refreshBtn" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <FiRefreshCw className={refreshing ? 'AdminMaterial-spinner' : ''} />
                Refresh
              </button>
              <button className="AdminMaterial-addBtn" onClick={openAddModal}>
                <FiPlus /> Add Material
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="AdminMaterial-search-section">
            {/* Search Bar */}
            <div className="AdminMaterial-searchBar">
              <FiSearch className="AdminMaterial-searchIcon" />
              <input
                type="text"
                placeholder="Search materials by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="AdminMaterial-clearSearch" onClick={() => setSearchTerm('')}>
                  <FiX />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button 
              className={`AdminMaterial-filter-toggle ${showUnitFilter ? 'active' : ''}`}
              onClick={() => setShowUnitFilter(!showUnitFilter)}
            >
              <FiFilter />
              <span>Filter by Unit</span>
              {(selectedUnit !== 'all' || searchTerm) && (
                <span className="AdminMaterial-filter-badge">
                  {selectedUnit !== 'all' && searchTerm ? '2' : '1'}
                </span>
              )}
            </button>
          </div>

          {/* Unit Filter Buttons */}
          {showUnitFilter && (
            <div className="AdminMaterial-unit-filters">
              <div className="AdminMaterial-filter-header">
                <h3>Filter by Unit</h3>
                {(selectedUnit !== 'all' || searchTerm) && (
                  <button className="AdminMaterial-clear-filters" onClick={clearFilters}>
                    <FiX /> Clear All
                  </button>
                )}
              </div>
              <div className="AdminMaterial-unit-buttons">
                <button
                  className={`AdminMaterial-unit-btn ${selectedUnit === 'all' ? 'active' : ''}`}
                  onClick={() => handleUnitFilter('all')}
                >
                  <span className="AdminMaterial-unit-label">All Units</span>
                  <span className="AdminMaterial-unit-count">{materials.length}</span>
                </button>

                {units.map(unit => {
                  const count = materials.filter(m => m.unit === unit.value).length;
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={unit.value}
                      className={`AdminMaterial-unit-btn ${selectedUnit === unit.value ? 'active' : ''}`}
                      onClick={() => handleUnitFilter(unit.value)}
                    >
                      <span className="AdminMaterial-unit-label">{unit.label}</span>
                      <span className="AdminMaterial-unit-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="AdminMaterial-statsGrid">
            <div className="AdminMaterial-statCard">
              <div className="AdminMaterial-statIcon">
                <BsBoxSeam />
              </div>
              <div className="AdminMaterial-statContent">
                <span className="AdminMaterial-statLabel">Total Materials</span>
                <span className="AdminMaterial-statValue">{materials.length}</span>
              </div>
            </div>
            
            <div className="AdminMaterial-statCard">
              <div className="AdminMaterial-statIcon">
                <BsCurrencyRupee />
              </div>
              <div className="AdminMaterial-statContent">
                <span className="AdminMaterial-statLabel">Avg Price</span>
                <span className="AdminMaterial-statValue">
                  {formatCurrency(
                    materials.reduce((sum, m) => sum + m.price, 0) / (materials.length || 1)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="AdminMaterial-resultsInfo">
            Showing {filteredMaterials.length} of {materials.length} materials
            {selectedUnit !== 'all' && (
              <span className="AdminMaterial-active-filter">
                Filtered by: {getUnitLabel(selectedUnit)}
              </span>
            )}
          </div>

          {/* Materials Table */}
          {filteredMaterials.length === 0 ? (
            <div className="AdminMaterial-noData">
              <FiPackage className="AdminMaterial-noData-icon" />
              <h3>No materials found</h3>
              <p>
                {selectedUnit !== 'all' 
                  ? `No materials with unit "${getUnitLabel(selectedUnit)}" found` 
                  : 'Add your first material to get started'}
              </p>
              <button className="AdminMaterial-addFirstBtn" onClick={openAddModal}>
                <FiPlus /> Add Material
              </button>
            </div>
          ) : (
            <div className="AdminMaterial-tableWrapper">
              <table className="AdminMaterial-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Unit</th>
                    <th>Category</th>
                    <th className="AdminMaterial-actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material) => (
                    <tr key={material._id}>
                      <td className="AdminMaterial-material-name">{material.name}</td>
                      <td className="AdminMaterial-material-price">{formatCurrency(material.price)}</td>
                      <td>
                        <span className="AdminMaterial-unit-badge">
                          {material.unit}
                        </span>
                      </td>
                      <td>{material.category || 'General'}</td>
                      <td className="AdminMaterial-actions-cell">
                        <div className="AdminMaterial-action-buttons">
                          <button 
                            className="AdminMaterial-action-btn AdminMaterial-edit-btn"
                            onClick={() => openEditModal(material)}
                            title="Edit Material"
                          >
                            <FiEdit2 />
                            <span className="AdminMaterial-action-tooltip">Edit</span>
                          </button>
                          <button 
                            className="AdminMaterial-action-btn AdminMaterial-delete-btn"
                            onClick={() => openDeleteModal(material)}
                            title="Delete Material"
                          >
                            <FiTrash2 />
                            <span className="AdminMaterial-action-tooltip">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="AdminMaterial-modalOverlay">
              <div className="AdminMaterial-modal">
                <div className="AdminMaterial-modalHeader">
                  <h2>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h2>
                  <button className="AdminMaterial-modalClose" onClick={closeModal}>
                    <FiX />
                  </button>
                </div>
                
                {error && (
                  <div className="AdminMaterial-modalError">
                    <p>{error}</p>
                  </div>
                )}
                
                <form className="AdminMaterial-form" onSubmit={handleSubmit}>
                  <div className="AdminMaterial-formGroup">
                    <label>Material Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter material name"
                      required
                    />
                  </div>

                  <div className="AdminMaterial-formRow">
                    <div className="AdminMaterial-formGroup">
                      <label>Price (Rs) *</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="AdminMaterial-formGroup">
                      <label>Unit *</label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        required
                      >
                        {units.map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="AdminMaterial-modalFooter">
                    <button 
                      type="button" 
                      className="AdminMaterial-cancelBtn" 
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="AdminMaterial-submitBtn" 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <FiSave /> {editingMaterial ? 'Update' : 'Save'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && materialToDelete && (
            <div className="AdminMaterial-modalOverlay">
              <div className="AdminMaterial-modal AdminMaterial-deleteModal">
                <div className="AdminMaterial-modalHeader">
                  <h2>Delete Material</h2>
                  <button className="AdminMaterial-modalClose" onClick={() => setShowDeleteModal(false)}>
                    <FiX />
                  </button>
                </div>
                
                <div className="AdminMaterial-modalBody">
                  <p>Are you sure you want to delete this material?</p>
                  <div className="AdminMaterial-deletePreview">
                    <p><strong>Name:</strong> {materialToDelete.name}</p>
                    <p><strong>Price:</strong> {formatCurrency(materialToDelete.price)}</p>
                    <p><strong>Unit:</strong> {materialToDelete.unit}</p>
                  </div>
                </div>
                
                <div className="AdminMaterial-modalFooter">
                  <button 
                    className="AdminMaterial-cancelBtn" 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="AdminMaterial-deleteBtn" 
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    {submitting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMaterial;